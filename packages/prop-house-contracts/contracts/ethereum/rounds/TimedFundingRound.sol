// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Clone } from 'solady/src/utils/Clone.sol';
import { IHouse } from '../interfaces/IHouse.sol';
import { IPropHouse } from '../interfaces/IPropHouse.sol';
import { REGISTER_ROUND_SELECTOR } from '../Constants.sol';
import { ITimedFundingRound } from '../interfaces/ITimedFundingRound.sol';
import { ITokenMetadataRenderer } from '../interfaces/ITokenMetadataRenderer.sol';
import { AssetController } from '../lib/utils/AssetController.sol';
import { IStarknetCore } from '../interfaces/IStarknetCore.sol';
import { ERC1155Supply } from '../lib/token/ERC1155Supply.sol';
import { MerkleProof } from '../lib/utils/MerkleProof.sol';
import { IMessenger } from '../interfaces/IMessenger.sol';
import { Asset, Award } from '../lib/types/Common.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';

contract TimedFundingRound is ITimedFundingRound, AssetController, ERC1155Supply, Clone {
    using { Uint256.split } for uint256;
    using { Uint256.toUint256 } for address;

    /// @notice Maximum winner count for this strategy
    uint256 public constant MAX_WINNER_COUNT = 256;

    /// @notice The amount of time before an award provider can reclaim unclaimed awards
    uint256 public constant AWARD_RECLAMATION_AFTER = 8 weeks;

    /// @notice The minimum proposal submission period duration
    uint256 public constant MIN_PROPOSAL_PERIOD_DURATION = 1 days;

    /// @notice The minimum vote period duration
    uint256 public constant MIN_VOTE_PERIOD_DURATION = 1 days;

    /// @notice The hash of the Starknet round contract
    uint256 public immutable classHash; // TODO: Consider one L2 factory per round type

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

    /// @notice Initialize the round by optionally defining the
    /// rounds configuration and registering it on L2.
    /// @dev This function is only callable by the prop house contract
    function initialize(bytes calldata data) external onlyPropHouse {
        if (data.length != 0) {
            _register(abi.decode(data, (RoundConfig)));
        }
    }

    /// @notice Define the configuration and register the round on L2.
    /// @param config The round configuration
    /// @dev This function is only callable by the round manager
    function register(RoundConfig calldata config) external onlyRoundManager {
        _register(config);
    }

    /// @notice Mint a deposit receipt to the provided address
    /// @param to The recipient address
    /// @param identifier The token identifier
    /// @param amount The token amount
    /// @dev This function is only callable by the prop house contract
    function mintReceipt(
        address to,
        uint256 identifier,
        uint256 amount
    ) external onlyPropHouse {
        _mint(to, identifier, amount, new bytes(0));
    }

    /// @notice Mint one or more deposit receipts to the provided address
    /// @param to The recipient address
    /// @param identifiers The token identifiers
    /// @param amounts The token amounts
    /// @dev This function is only callable by the prop house contract
    function mintReceipts(
        address to,
        uint256[] memory identifiers,
        uint256[] memory amounts
    ) external onlyPropHouse {
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
        address caller = msg.sender;
        if (isAwardClaimed(proposalId)) {
            revert AWARD_ALREADY_CLAIMED();
        }
        uint256 assetId = _getAssetID(asset);

        bytes32 leaf = keccak256(abi.encode(proposalId, caller, assetId, amount));
        if (!MerkleProof.verify(proof, winnerMerkleRoot, leaf)) {
            revert INVALID_MERKLE_PROOF();
        }
        _setAwardClaimed(proposalId);
        _transfer(asset, address(this), payable(recipient));

        emit AwardClaimed(proposalId, caller, assetId, amount, recipient);
    }

    /// @notice Claim a round award to the caller
    /// @param proposalId The winning proposal ID
    /// @param amount The award amount
    /// @param asset The award asset to claim
    /// @param proof The merkle proof used to verify the validity of the award payout
    function claimAward(
        uint256 proposalId,
        uint256 amount,
        Asset calldata asset,
        bytes32[] calldata proof
    ) external {
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
            uint256 assetId = _getAssetID(assets[i]);

            // Burn deposit credits. This will revert if the caller does not have enough credits.
            _burn(reclaimer, assetId, assets[i].amount);

            // Transfer the asset to the recipient
            _transfer(assets[i], address(this), payable(recipient));

            emit AssetReclaimed(recipient, assetId, assets[i].amount);

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
            uint256 assetId = _getAssetID(assets[i]);
            uint256 balanceOf = _balanceOf(assets[i], address(this));

            if (balanceOf - assets[i].amount < totalSupply(assetId)) {
                revert NO_EXCESS_BALANCE();
            }

            // Transfer the excess amount to the recipient
            _transfer(assets[i], address(this), payable(recipient));

            emit AssetRescued(recipient, assetId, assets[i].amount);

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
        messenger.sendMessageToL2(roundFactory, REGISTER_ROUND_SELECTOR, _getL2Payload(config));

        emit RoundRegistered(
            config.awards,
            config.strategies,
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
        if (config.proposalPeriodDuration < MIN_PROPOSAL_PERIOD_DURATION) {
            revert PROPOSAL_PERIOD_DURATION_TOO_SHORT();
        }
        if (config.proposalPeriodStartTimestamp < block.timestamp) {
            revert PROPOSAL_PERIOD_START_TIMESTAMP_IN_PAST();
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
        if (config.strategies.length == 0) {
            revert NO_STRATEGIES_PROVIDED();
        }
    }

    /// @notice Generate the payload required to register the round on L2
    /// @param config The round configuration
    function _getL2Payload(RoundConfig memory config) internal view returns (uint256[] memory payload) {
        uint256[] memory flattenedStrategies = _flatten(config.strategies);
        uint256 flattenedStrategyCount = flattenedStrategies.length;
        payload = new uint256[](10 + flattenedStrategyCount);

        // `payload[0]` is reserved for the round address, which is
        // set in the messenger contract for security purposes.
        payload[1] = classHash;

        // L2 strategy params
        payload[2] = 6;
        (payload[3], payload[4]) = uint256(keccak256(abi.encode(config.awards))).split();
        payload[5] = proposalPeriodStartTimestamp;
        payload[6] = proposalPeriodDuration;
        payload[7] = votePeriodDuration;
        payload[8] = winnerCount;

        // L2 voting strategies
        unchecked {
            payload[9] = flattenedStrategyCount;
            for (uint256 i = 0; i < flattenedStrategyCount; ++i) {
                payload[10 + i] = flattenedStrategies[i];
            }
        }
        return payload;
    }

    /// @notice Flatten voting strategies for consumption on L2.
    /// @param strategies The voting strategies
    function _flatten(VotingStrategy[] memory strategies) internal pure returns (uint256[] memory) {
        unchecked {
            uint256 strategyCount = strategies.length;
            uint256 paramCount = _getTotalParamCount(strategies);
            uint256[] memory flattenedStrategies = new uint256[](strategyCount + paramCount);

            uint256 offset;
            for (uint256 i = 0; i < strategyCount; ++i) {
                VotingStrategy memory strategy = strategies[i];
                if (strategy.addr == 0) {
                    revert INVALID_VOTING_STRATEGY();
                }

                flattenedStrategies[offset++] = strategy.addr;
                for (uint256 k = 0; k < strategy.params.length; ++k) {
                    flattenedStrategies[offset++] = strategy.params[k];
                }
            }
            return flattenedStrategies;
        }
    }

    /// @notice Get the total number of voting strategy parameters
    /// @param strategies The voting strategies
    function _getTotalParamCount(VotingStrategy[] memory strategies) internal pure returns (uint256 count) {
        uint256 strategyCount = strategies.length;
        for (uint256 i = 0; i < strategyCount; ++i) {
            count += strategies[i].params.length;
        }
    }

    /// @notice Mark an award as 'claimed' for the provided proposal ID
    /// @param proposalId The winning proposal ID
    function _setAwardClaimed(uint256 proposalId) internal {
        _claimedBitmap[proposalId >> 8] |= (1 << (proposalId & 0xff));
    }
}
