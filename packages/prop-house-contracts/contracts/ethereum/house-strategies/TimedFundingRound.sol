// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Clone } from 'solady/src/utils/Clone.sol';
import { IHouse } from '../interfaces/IHouse.sol';
import { REGISTER_HOUSE_STRATEGY_SELECTOR } from '../Constants.sol';
import { IFundingHouse } from '../interfaces/houses/IFundingHouse.sol';
import { ITimedFundingRound } from '../interfaces/house-strategies/ITimedFundingRound.sol';
import { ITokenMetadataRenderer } from '../interfaces/renderers/ITokenMetadataRenderer.sol';
import { AssetController } from '../lib/utils/AssetController.sol';
import { IStarknetCore } from '../interfaces/IStarknetCore.sol';
import { ERC1155Supply } from '../lib/token/ERC1155Supply.sol';
import { MerkleProof } from '../lib/utils/MerkleProof.sol';
import { Asset, Award } from '../lib/types/Common.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';
import { Sort } from '../lib/utils/Sort.sol';

contract TimedFundingRound is ITimedFundingRound, AssetController, ERC1155Supply, Clone {
    using Sort for Award[];

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

    /// @notice The hash of the house strategy on Starknet
    uint256 public immutable classHash;

    /// @notice The contract used to route ETH, ERC20, ERC721, & ERC1155 tokens to this contract
    address public immutable awardRouter;

    /// @notice The Starknet Core contract
    IStarknetCore public immutable starknet;

    /// @notice The Asset Metadata Renderer contract
    ITokenMetadataRenderer public immutable renderer;

    /// @notice The Strategy Factory contract address on Starknet
    uint256 internal immutable strategyFactory;

    /// @notice The generalized execution relayer contract on Starknet
    uint256 public immutable executionRelayer;

    /// @notice Get the address of the house on which this strategy belongs
    /// @dev Value is read using clone-with-immutable-args from contract's code region.
    function house() public pure returns (address) {
        return _getArgAddress(0);
    }

    /// @notice Get the ID of this round. Note that this maps to the token ID on the house contract.
    /// @dev Value is read using clone-with-immutable-args from contract's code region.
    function roundId() public pure returns (uint256) {
        return _getArgUint256(20);
    }

    /// @notice Get the number of voting strategies
    /// @dev Value is read using clone-with-immutable-args from contract's code region.
    function numVotingStrategies() public pure returns (uint8) {
        return _getArgUint8(52);
    }

    /// @notice Get the voting strategies
    /// @dev Value is read using clone-with-immutable-args from contract's code region.
    function votingStrategies() public pure returns (uint256[] memory) {
        return _getArgUint256Array(53, numVotingStrategies());
    }

    /// @notice The current state of the timed funding round
    RoundState public state;

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    uint40 public roundFinalizedAt;

    /// @notice The timestamp at which the proposal period starts. `0` when in pending state.
    uint40 public proposalPeriodStartTimestamp;

    /// @notice The proposal period duration in seconds. `0` when in pending state.
    uint40 public proposalPeriodDuration;

    /// @notice The vote period duration in seconds. `0` when in pending state.
    uint40 public votePeriodDuration;

    /// @notice The number of possible winners. `0` when in pending state.
    uint16 public winnerCount;

    /// @notice The merkle root that allows winners to claim their awards. `bytes32(0)` if not finalized.
    bytes32 public winnerMerkleRoot;

    /// @notice Determine if a proposer has claimed their award
    /// @dev Proposal IDs map to bits in the uint256 mapping
    mapping(uint256 => uint256) private _claimedBitmap;

    /// @notice Require that the sender is the house that created this strategy
    modifier onlyHouse() {
        if (msg.sender != house()) {
            revert ONLY_HOUSE();
        }
        _;
    }

    /// @notice Require that the sender is the round manager
    modifier onlyRoundManager() {
        if (msg.sender != IFundingHouse(house()).ownerOf(roundId())) {
            revert ONLY_ROUND_MANAGER();
        }
        _;
    }

    /// @notice Require that the sender is the award router
    modifier onlyAwardRouter() {
        if (msg.sender != awardRouter) {
            revert ONLY_AWARD_ROUTER();
        }
        _;
    }

    constructor(
        uint256 _classHash,
        address _awardRouter,
        address _starknet,
        address _renderer,
        uint256 _strategyFactory,
        uint256 _executionRelayer
    ) {
        classHash = _classHash;
        awardRouter = _awardRouter;
        starknet = IStarknetCore(_starknet);
        renderer = ITokenMetadataRenderer(_renderer);
        strategyFactory = _strategyFactory;
        executionRelayer = _executionRelayer;
    }

    /// @notice Returns the deposit token URI for the provided token ID
    /// @param tokenId The deposit token ID
    function uri(uint256 tokenId) public view override returns (string memory) {
        return renderer.tokenURI(tokenId);
    }

    /// @notice Initialize the strategy by optionally defining the round's
    /// configuration and registering the round on L2.
    /// @dev This function is only callable by the house
    function initialize(bytes calldata data) external onlyHouse {
        if (data.length != 0) {
            RoundConfig memory config = abi.decode(data, (RoundConfig));

            _defineRound(
                config.proposalPeriodStartTimestamp,
                config.proposalPeriodDuration,
                config.votePeriodDuration,
                config.winnerCount
            );
            if (config.awards.length != 0) {
                _registerRound(config.awards);
            }
        }
    }

    /// @notice Mint deposit tokens to the provided address
    /// @param to The recipient address
    /// @param id The token identifier
    /// @param amount The token amount
    /// @dev This function is only callable by the award router
    function mintDepositTokens(
        address to,
        uint256 id,
        uint256 amount
    ) external onlyAwardRouter {
        _mint(to, id, amount, new bytes(0));
    }

    /// @notice Batch mint deposit tokens to the provided address
    /// @param to The recipient address
    /// @param ids The token identifiers
    /// @param amounts The token amounts
    /// @dev This function is only callable by the award router
    function batchMintDepositTokens(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyAwardRouter {
        _batchMint(to, ids, amounts, new bytes(0));
    }

    /// @notice Define the round's configuration, assign awards, validate balances,
    /// and register the round on L2. This function should be used if the configuration
    /// was not defined during round initialization. The round must be fully funded
    /// before this function is called.
    /// @param config The round configuration
    /// @dev This function is only callable by the round manager
    function defineAndRegisterRound(RoundConfig calldata config) external onlyRoundManager {
        _defineRound(
            config.proposalPeriodStartTimestamp,
            config.proposalPeriodDuration,
            config.votePeriodDuration,
            config.winnerCount
        );
        _registerRound(config.awards);
    }

    /// @notice Assign awards, validate balances, and register the round on L2. This function
    /// should be used if the configuration was defined during round initialization, but the
    /// awards have not yet been assigned and the round has not been registered. The round
    /// must be fully funded before this function is called.
    /// @param awards The round award assets
    /// @dev This function is only callable by the round manager
    function registerRound(Award[] calldata awards) external onlyRoundManager {
        _registerRound(awards);
    }

    /// @notice Cancel the timed funding round
    /// @dev This function is only callable by the round manager
    function cancel() external onlyRoundManager {
        if (state != RoundState.Pending && state != RoundState.Active) {
            revert CANCELLATION_NOT_AVAILABLE();
        }
        state = RoundState.Cancelled;

        // TODO: Cancel the round on L2 using a state proof (if necessary)

        emit RoundCancelled();
    }

    /// @notice Finalize a round by consuming the merkle root from Starknet.
    /// @param merkleRootLow The lower half of the split merkle root
    /// @param merkleRootHigh The higher half of the split merkle root
    function finalizeRound(uint256 merkleRootLow, uint256 merkleRootHigh) external {
        if (state != RoundState.Active) {
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
        // Reclamation is only available when the round is pending or cancelled OR the round has been finalized and is in the reclamation period
        if (state == RoundState.Active || (state == RoundState.Finalized && block.timestamp - roundFinalizedAt < AWARD_RECLAMATION_AFTER)) {
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

    /// @notice Set the round configuration. Once the configuration is set, it cannot be updated.
    /// @param proposalPeriodStartTimestamp_ The timestamp at which the proposal period starts
    /// @param proposalPeriodDuration_ The proposal period duration in seconds
    /// @param votePeriodDuration_ The vote period duration in seconds
    /// @param winnerCount_ The number of possible winners
    function _defineRound(
        uint40 proposalPeriodStartTimestamp_,
        uint40 proposalPeriodDuration_,
        uint40 votePeriodDuration_,
        uint16 winnerCount_
    ) internal {
        // To protect depositors, the round can only be defined once
        if (winnerCount != 0) {
            revert ROUND_ALREADY_DEFINED();
        }

        // Ensure the round configuration is valid
        if (proposalPeriodDuration_ < MIN_PROPOSAL_PERIOD_DURATION) {
            revert PROPOSAL_PERIOD_DURATION_TOO_SHORT();
        }
        if (proposalPeriodStartTimestamp_ + proposalPeriodDuration_ < block.timestamp + MIN_PROPOSAL_PERIOD_DURATION) {
            revert REMAINING_PROPOSAL_PERIOD_DURATION_TOO_SHORT();
        }
        if (votePeriodDuration_ < MIN_VOTE_PERIOD_DURATION) {
            revert VOTE_PERIOD_DURATION_TOO_SHORT();
        }
        if (winnerCount_ == 0) {
            revert WINNER_COUNT_CANNOT_BE_ZERO();
        }
        if (winnerCount_ > MAX_WINNER_COUNT) {
            revert WINNER_COUNT_EXCEEDS_MAXIMUM();
        }

        // Write round metadata to storage. This will be consumed by the token URI later.
        proposalPeriodStartTimestamp = proposalPeriodStartTimestamp_;
        proposalPeriodDuration = proposalPeriodDuration_;
        votePeriodDuration = votePeriodDuration_;
        winnerCount = winnerCount_;

        emit RoundDefined(proposalPeriodStartTimestamp_, proposalPeriodDuration_, votePeriodDuration_, winnerCount_);
    }

    // prettier-ignore
    /// @notice Assign round awards, validate balances, and register the round on L2
    /// @param awards The round award assets
    function _registerRound(Award[] memory awards) internal {
        // The configuration must be defined prior to registration
        if (winnerCount == 0) {
            revert ROUND_NOT_DEFINED();
        }
        if (state != RoundState.Pending) {
            revert ROUND_ALREADY_REGISTERED();
        }

        // Ensure awards are valid and there is enough time remaining in the proposal period
        if (proposalPeriodStartTimestamp + proposalPeriodDuration < block.timestamp + MIN_PROPOSAL_PERIOD_DURATION) {
            revert REMAINING_PROPOSAL_PERIOD_DURATION_TOO_SHORT();
        }
        if (awards.length != 1 && awards.length != winnerCount) {
            revert INVALID_AWARD_LENGTH();
        }
        if (awards.length == 1 && winnerCount > 1 && awards[0].amount % winnerCount != 0) {
            revert INVALID_AWARD_AMOUNT();
        }

        // Ensure the round is sufficiently funded
        if (!_isFullyFunded(awards)) {
            revert INSUFFICIENT_ASSET_FUNDING();
        }

        state = RoundState.Active;

        IHouse(house()).forwardMessageToL2(strategyFactory, REGISTER_HOUSE_STRATEGY_SELECTOR, _getL2Payload(awards));

        emit RoundRegistered(awards);
    }

    /// @notice Determine if the round has been sufficiently funded to back the
    // selected awards.
    /// @param awards The selected awards
    function _isFullyFunded(Award[] memory awards) internal view returns (bool) {
        uint256 awardCount = awards.length;

        // Funding checks require the array to be sorted
        awards.sort(0, int256(awardCount - 1));

        uint256 allocated;
        Award memory currAsset;
        Award memory prevAsset;
        for (uint256 i = 0; i < awardCount; ) {
            currAsset = awards[i];
            if (currAsset.assetId == prevAsset.assetId) {
                allocated += currAsset.amount;
            } else {
                if (totalSupply(prevAsset.assetId) < allocated) {
                    return false;
                }
                allocated = currAsset.amount;
            }
            prevAsset = currAsset;

            unchecked {
                ++i;
            }
        }
        return true;
    }

    /// @notice Generate the payload required to register the round on L2
    /// @param awards The round award assets
    function _getL2Payload(Award[] memory awards) internal view returns (uint256[] memory payload) {
        uint8 _numVotingStrategies = numVotingStrategies();
        uint256[] memory _votingStrategies = votingStrategies();

        payload = new uint256[](10 + _numVotingStrategies);

        // L1 strategy address & L2 class hash
        payload[0] = address(this).toUint256();
        payload[1] = classHash;

        // L2 strategy params
        payload[2] = 6;
        (payload[3], payload[4]) = uint256(keccak256(abi.encode(awards))).split();
        payload[5] = proposalPeriodStartTimestamp;
        payload[6] = proposalPeriodDuration;
        payload[7] = votePeriodDuration;
        payload[8] = winnerCount;

        unchecked {
            // L2 voting strategies
            payload[9] = _numVotingStrategies;
            for (uint256 i = 0; i < _numVotingStrategies; ++i) {
                payload[10 + i] = _votingStrategies[i];
            }
        }
        return payload;
    }

    /// @notice Mark an award as 'claimed' for the provided proposal ID
    /// @param proposalId The winning proposal ID
    function _setAwardClaimed(uint256 proposalId) internal {
        _claimedBitmap[proposalId >> 8] |= (1 << (proposalId & 0xff));
    }
}
