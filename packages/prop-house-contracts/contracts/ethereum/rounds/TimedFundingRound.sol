// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Clone } from 'solady/src/utils/Clone.sol';
import { IHouse } from '../interfaces/IHouse.sol';
import { IPropHouse } from '../interfaces/IPropHouse.sol';
import { ITimedFundingRound } from '../interfaces/ITimedFundingRound.sol';
import { REGISTER_ROUND_SELECTOR, TIMED_FUNDING_ROUND_TYPE } from '../Constants.sol';
import { ITokenMetadataRenderer } from '../interfaces/ITokenMetadataRenderer.sol';
import { AssetController } from '../lib/utils/AssetController.sol';
import { IStarknetCore } from '../interfaces/IStarknetCore.sol';
import { ERC1155Supply } from '../lib/token/ERC1155Supply.sol';
import { ReceiptIssuer } from '../lib/utils/ReceiptIssuer.sol';
import { Asset, PackedAsset } from '../lib/types/Common.sol';
import { AssetHelper } from '../lib/utils/AssetHelper.sol';
import { MerkleProof } from '../lib/utils/MerkleProof.sol';
import { TokenHolder } from '../lib/utils/TokenHolder.sol';
import { IMessenger } from '../interfaces/IMessenger.sol';
import { IERC165 } from '../interfaces/IERC165.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';
import { ERC1155 } from '../lib/token/ERC1155.sol';

contract TimedFundingRound is ITimedFundingRound, AssetController, TokenHolder, ERC1155Supply, ReceiptIssuer, Clone {
    using { Uint256.split } for uint256;
    using { Uint256.toUint256 } for address;
    using { AssetHelper.toID } for Asset;
    using { AssetHelper.pack } for Asset[];

    /// @notice Maximum winner count for this strategy
    uint256 public constant MAX_WINNER_COUNT = 256;

    /// @notice The amount of time before an award provider can reclaim unclaimed awards
    uint256 public constant AWARD_RECLAMATION_AFTER = 8 weeks;

    /// @notice The minimum proposal submission period duration
    uint256 public constant MIN_PROPOSAL_PERIOD_DURATION = 1 days;

    /// @notice The minimum vote period duration
    uint256 public constant MIN_VOTE_PERIOD_DURATION = 1 days;

    /// @notice The round type
    bytes32 public immutable kind;

    /// @notice The hash of the Starknet round contract
    uint256 public immutable classHash;

    /// @notice The entrypoint for all house and round creation
    IPropHouse public immutable propHouse;

    /// @notice The Starknet Core contract
    IStarknetCore public immutable starknet;

    /// @notice The Starknet Messenger contract
    IMessenger public immutable messenger;

    /// @notice The Asset Metadata Renderer contract
    ITokenMetadataRenderer public immutable renderer;

    /// @notice The Round Factory contract address on Starknet
    uint256 internal immutable roundFactory;

    /// @notice The generalized execution relayer contract on Starknet
    uint256 public immutable executionRelayer;

    /// @notice Get the address of the house on which this strategy belongs
    /// @dev Value is read using clone-with-immutable-args from contract's code region.
    function house() public pure returns (address) {
        return _getArgAddress(0);
    }

    /// @notice Get the round title
    /// @dev Value is read using clone-with-immutable-args from contract's code region.
    function title() public pure returns (string memory) {
        return string(_getArgBytes(21, _getArgUint8(20)));
    }

    /// @notice Get the round ID
    function id() public view returns (uint256) {
        return address(this).toUint256();
    }

    /// @notice The current state of the timed funding round
    RoundState public state;

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    uint40 public roundFinalizedAt;

    /// @notice The timestamp at which the proposal period starts. `0` if not registered.
    uint40 public proposalPeriodStartTimestamp;

    /// @notice The proposal period duration in seconds. `0` if not registered.
    uint40 public proposalPeriodDuration;

    /// @notice The vote period duration in seconds. `0` if not registered.
    uint40 public votePeriodDuration;

    /// @notice The number of possible winners. `0` if not registered.
    uint16 public winnerCount;

    /// @notice The merkle root that allows winners to claim their awards. `bytes32(0)` if not finalized.
    bytes32 public winnerMerkleRoot;

    /// @notice Determine if a proposer has claimed their award
    /// @dev Proposal IDs map to bits in the uint256 mapping
    mapping(uint256 => uint256) private _claimedBitmap;

    /// @notice Require that the caller is the round manager
    modifier onlyRoundManager() {
        if (msg.sender != IHouse(house()).ownerOf(id())) {
            revert ONLY_ROUND_MANAGER();
        }
        _;
    }

    /// @notice Require that the caller is the prop house contract
    modifier onlyPropHouse() {
        if (msg.sender != address(propHouse)) {
            revert ONLY_PROP_HOUSE();
        }
        _;
    }

    constructor(
        uint256 _classHash,
        address _propHouse,
        address _starknet,
        address _messenger,
        address _renderer,
        uint256 _roundFactory,
        uint256 _executionRelayer
    ) {
        kind = TIMED_FUNDING_ROUND_TYPE;

        classHash = _classHash;
        propHouse = IPropHouse(_propHouse);
        starknet = IStarknetCore(_starknet);
        messenger = IMessenger(_messenger);
        renderer = ITokenMetadataRenderer(_renderer);
        roundFactory = _roundFactory;
        executionRelayer = _executionRelayer;
    }

    /// @notice Returns the deposit token URI for the provided token ID
    /// @param tokenId The deposit token ID
    function uri(uint256 tokenId) public view override returns (string memory) {
        return renderer.tokenURI(tokenId);
    }

    // prettier-ignore
    /// @notice If the contract implements an interface
    /// @param interfaceId The interface id
    function supportsInterface(bytes4 interfaceId) public view override(ReceiptIssuer, TokenHolder, ERC1155, IERC165) returns (bool) {
        return ReceiptIssuer.supportsInterface(interfaceId) || TokenHolder.supportsInterface(interfaceId) || ERC1155.supportsInterface(interfaceId);
    }

    /// @notice Initialize the round by optionally defining the
    /// rounds configuration and registering it on L2.
    /// @dev This function is only callable by the prop house contract
    function initialize(bytes calldata data) external payable onlyPropHouse {
        if (data.length != 0) {
            return _register(abi.decode(data, (RoundConfig)));
        }
        if (msg.value != 0) {
            revert EXCESS_ETH_PROVIDED();
        }
    }

    /// @notice Define the configuration and register the round on L2.
    /// @param config The round configuration
    /// @dev This function is only callable by the round manager
    function register(RoundConfig calldata config) external payable onlyRoundManager {
        _register(config);
    }

    /// @notice Issue a deposit receipt to the provided address
    /// @param to The recipient address
    /// @param identifier The token identifier
    /// @param amount The token amount
    /// @dev This function is only callable by the prop house contract
    function issueReceipt(address to, uint256 identifier, uint256 amount) external onlyPropHouse {
        _mint(to, identifier, amount, new bytes(0));
    }

    /// @notice Issue one or more deposit receipts to the provided address
    /// @param to The recipient address
    /// @param identifiers The token identifiers
    /// @param amounts The token amounts
    /// @dev This function is only callable by the prop house contract
    function issueReceipts(address to, uint256[] memory identifiers, uint256[] memory amounts) external onlyPropHouse {
        _batchMint(to, identifiers, amounts, new bytes(0));
    }

    /// @notice Cancel the timed funding round
    /// @dev This function is only callable by the round manager
    function cancel() external onlyRoundManager {
        if (state != RoundState.AwaitingRegistration && state != RoundState.Registered) {
            revert CANCELLATION_NOT_AVAILABLE();
        }
        state = RoundState.Cancelled;

        // TODO: Cancel the round on L2 using a state proof

        emit RoundCancelled();
    }

    /// @notice Finalize a round by consuming the merkle root from Starknet.
    /// @param merkleRootLow The lower half of the split merkle root
    /// @param merkleRootHigh The higher half of the split merkle root
    function finalizeRound(uint256 merkleRootLow, uint256 merkleRootHigh) external {
        if (state != RoundState.Registered) {
            revert FINALIZATION_NOT_AVAILABLE();
        }

        uint256[] memory payload = new uint256[](3);
        payload[0] = uint256(ExecutionType.MerkleProof);
        payload[1] = merkleRootLow;
        payload[2] = merkleRootHigh;

        // This function will revert if the message does not exist
        starknet.consumeMessageFromL2(executionRelayer, payload);

        // Reconstruct the execution hash, store it, and move the round to the finalized state
        winnerMerkleRoot = bytes32((merkleRootHigh << 128) + merkleRootLow);
        roundFinalizedAt = uint40(block.timestamp);
        state = RoundState.Finalized;

        emit RoundFinalized();
    }

    /// @notice Claim a round award to a custom recipient
    /// @param proposalId The winning proposal ID
    /// @param recipient The award recipient
    /// @param amount The award amount
    /// @param asset The award asset to claim
    /// @param proof The merkle proof used to verify the validity of the award payout
    function claimAwardToRecipient(
        uint256 proposalId,
        address recipient,
        uint256 amount,
        Asset calldata asset,
        bytes32[] calldata proof
    ) public {
        address claimer = msg.sender;
        if (isAwardClaimed(proposalId)) {
            revert AWARD_ALREADY_CLAIMED();
        }
        uint256 assetId = asset.toID();

        bytes32 leaf = keccak256(abi.encode(proposalId, claimer, assetId, amount));
        if (!MerkleProof.verify(proof, winnerMerkleRoot, leaf)) {
            revert INVALID_MERKLE_PROOF();
        }
        _setAwardClaimed(proposalId);
        _transfer(asset, address(this), payable(recipient));

        emit AwardClaimed(proposalId, claimer, recipient, assetId, amount);
    }

    /// @notice Claim a round award to the caller
    /// @param proposalId The winning proposal ID
    /// @param amount The award amount
    /// @param asset The award asset to claim
    /// @param proof The merkle proof used to verify the validity of the award payout
    function claimAward(uint256 proposalId, uint256 amount, Asset calldata asset, bytes32[] calldata proof) external {
        claimAwardToRecipient(proposalId, msg.sender, amount, asset, proof);
    }

    /// @notice Reclaim assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param assets The assets to reclaim
    function reclaimToRecipient(address recipient, Asset[] calldata assets) public {
        // prettier-ignore
        // Reclamation is only available when the round is awaiting registration or
        // cancelled OR the round has been finalized and is in the reclamation period
        if (state == RoundState.Registered || (state == RoundState.Finalized && block.timestamp - roundFinalizedAt < AWARD_RECLAMATION_AFTER)) {
            revert RECLAMATION_NOT_AVAILABLE();
        }

        uint256 assetCount = assets.length;
        address reclaimer = msg.sender;

        for (uint256 i = 0; i < assetCount; ) {
            uint256 assetId = assets[i].toID();

            // Burn deposit credits. This will revert if the caller does not have enough credits.
            _burn(reclaimer, assetId, assets[i].amount);

            // Transfer the asset to the recipient
            _transfer(assets[i], address(this), payable(recipient));

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Reclaim assets to the caller
    /// @param assets The assets to reclaim
    function reclaim(Asset[] calldata assets) external {
        reclaimToRecipient(msg.sender, assets);
    }

    /// @notice Rescue assets that were accidentally deposited directly to this contract
    /// @param recipient The recipient of the rescued assets
    /// @param assets The assets to rescue
    /// @dev This function is only callable by the round manager
    function rescueAssets(address recipient, Asset[] calldata assets) external onlyRoundManager {
        uint256 assetCount = assets.length;

        for (uint256 i = 0; i < assetCount; ) {
            uint256 assetId = assets[i].toID();
            uint256 balanceOf = _balanceOf(assets[i], address(this));

            if (balanceOf - assets[i].amount < totalSupply(assetId)) {
                revert NO_EXCESS_BALANCE();
            }

            // Transfer the excess amount to the recipient
            _transfer(assets[i], address(this), payable(recipient));

            emit AssetRescued(msg.sender, recipient, assetId, assets[i].amount);

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Determine whether an award has been claimed for a specific proposal ID
    /// @param proposalId The proposal ID
    function isAwardClaimed(uint256 proposalId) public view returns (bool isClaimed) {
        uint256 isBitSet = (_claimedBitmap[proposalId >> 8] >> (proposalId & 0xff)) & 1;
        assembly {
            isClaimed := isBitSet
        }
    }

    /// @notice Generate the payload required to register the round on L2
    /// @param config The round configuration
    function getL2Payload(RoundConfig memory config) public view returns (uint256[] memory payload) {
        uint256 strategyCount = config.votingStrategies.length;
        uint256 strategyParamsFlatCount = config.votingStrategyParamsFlat.length;

        payload = new uint256[](11 + strategyCount + strategyParamsFlatCount);

        // `payload[0]` is reserved for the round address, which is
        // set in the messenger contract for security purposes.
        payload[1] = classHash;

        // L2 strategy params
        payload[2] = 8 + strategyCount + strategyParamsFlatCount;
        (payload[3], payload[4]) = uint256(keccak256(abi.encode(config.awards.pack()))).split();
        payload[5] = config.proposalPeriodStartTimestamp;
        payload[6] = config.proposalPeriodDuration;
        payload[7] = config.votePeriodDuration;
        payload[8] = config.winnerCount;

        // L2 voting strategies
        unchecked {
            payload[9] = strategyCount;

            uint256 offset = 9;
            for (uint256 i = 0; i < strategyCount; ++i) {
                uint256 strategy = config.votingStrategies[i];
                if (strategy == 0) {
                    revert INVALID_VOTING_STRATEGY();
                }
                payload[++offset] = config.votingStrategies[i];
            }

            payload[++offset] = strategyParamsFlatCount;
            for (uint256 i = 0; i < strategyParamsFlatCount; ++i) {
                payload[++offset] = config.votingStrategyParamsFlat[i];
            }
        }
        return payload;
    }

    /// @notice Define the configuration and register the round on L2.
    /// Duplicate voting strategies are handled on L2.
    /// @param config The round configuration
    function _register(RoundConfig memory config) internal {
        if (state != RoundState.AwaitingRegistration) {
            revert ROUND_ALREADY_REGISTERED();
        }
        _requireConfigValid(config);

        // Write round metadata to storage. This will be consumed by the token URI later.
        proposalPeriodStartTimestamp = config.proposalPeriodStartTimestamp;
        proposalPeriodDuration = config.proposalPeriodDuration;
        votePeriodDuration = config.votePeriodDuration;
        winnerCount = config.winnerCount;

        state = RoundState.Registered;

        // Register the round on L2
        messenger.sendMessageToL2{ value: msg.value }(roundFactory, REGISTER_ROUND_SELECTOR, getL2Payload(config));

        emit RoundRegistered(
            config.awards,
            config.votingStrategies,
            config.votingStrategyParamsFlat,
            config.proposalPeriodStartTimestamp,
            config.proposalPeriodDuration,
            config.votePeriodDuration,
            config.winnerCount
        );
    }

    // prettier-ignore
    /// @notice Revert if the round configuration is invalid
    /// @param config The round configuration
    function _requireConfigValid(RoundConfig memory config) internal view {
        if (config.proposalPeriodStartTimestamp + config.proposalPeriodDuration < block.timestamp + MIN_PROPOSAL_PERIOD_DURATION) {
            revert REMAINING_PROPOSAL_PERIOD_DURATION_TOO_SHORT();
        }
        if (config.votePeriodDuration < MIN_VOTE_PERIOD_DURATION) {
            revert VOTE_PERIOD_DURATION_TOO_SHORT();
        }
        if (config.winnerCount == 0 || config.winnerCount > MAX_WINNER_COUNT) {
            revert WINNER_COUNT_OUT_OF_RANGE();
        }
        if (config.awards.length != 1 && config.awards.length != config.winnerCount) {
            revert AWARD_LENGTH_MISMATCH();
        }
        if (config.awards.length == 1 && config.winnerCount > 1 && config.awards[0].amount % config.winnerCount != 0) {
            revert AWARD_AMOUNT_NOT_MULTIPLE_OF_WINNER_COUNT();
        }
        if (config.votingStrategies.length == 0) {
            revert NO_STRATEGIES_PROVIDED();
        }
    }

    /// @notice Mark an award as 'claimed' for the provided proposal ID
    /// @param proposalId The winning proposal ID
    function _setAwardClaimed(uint256 proposalId) internal {
        _claimedBitmap[proposalId >> 8] |= (1 << (proposalId & 0xff));
    }
}
