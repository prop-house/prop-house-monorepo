// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IManager } from './interfaces/IManager.sol';
import { AssetController } from './lib/utils/AssetController.sol';
import { PROP_HOUSE_NAME, PROP_HOUSE_SYMBOL, PROP_HOUSE_URI } from './Constants.sol';
import { AssetType, Asset } from './lib/types/Common.sol';
import { IPropHouse } from './interfaces/IPropHouse.sol';
import { LibClone } from 'solady/src/utils/LibClone.sol';
import { Uint256 } from './lib/utils/Uint256.sol';
import { IHouse } from './interfaces/IHouse.sol';
import { IRound } from './interfaces/IRound.sol';
import { ERC721 } from './lib/token/ERC721.sol';

/// @notice The entrypoint for house and round creation
contract PropHouse is IPropHouse, ERC721, AssetController {
    using { Uint256.toUint256 } for address;
    using LibClone for address;

    /// @notice The Prop House Manager contract
    IManager public immutable manager;

    /// @param _manager The Prop House Manager contract address
    constructor(address _manager) initializer {
        manager = IManager(_manager);

        __ERC721_init(PROP_HOUSE_NAME, PROP_HOUSE_SYMBOL, PROP_HOUSE_URI);
    }

    /// @notice Deposit an asset to the provided round
    /// @param round The round to deposit to
    /// @param asset The asset to transfer to the round
    /// @dev For safety, this function validates the round before the transfer
    function depositTo(address payable round, Asset calldata asset) external payable {
        if (!isRound(round)) {
            revert INVALID_ROUND();
        }
        _depositTo(msg.sender, round, asset);
    }

    /// @notice Deposit many assets to the provided round
    /// @param round The round to deposit to
    /// @param assets The assets to transfer to the round
    /// @dev For safety, this function validates the round before the transfer
    function batchDepositTo(address payable round, Asset[] calldata assets) external payable {
        if (!isRound(round)) {
            revert INVALID_ROUND();
        }
        _batchDepositTo(msg.sender, round, assets);
    }

    /// @notice Create a round on an existing house
    /// @param house The house to create the round on
    /// @param newRound The round creation data
    function createRoundOnExistingHouse(address house, Round calldata newRound) external returns (address round) {
        if (!isHouse(house)) {
            revert INVALID_HOUSE();
        }
        if (!manager.isRoundRegistered(_getImpl(house), newRound.impl)) {
            revert INVALID_ROUND_IMPL_FOR_HOUSE();
        }

        round = _createRound(house, newRound);
        IRound(round).initialize(newRound.config);
    }

    /// @notice Create a round on an existing house and deposit assets to the round
    /// @param house The house to create the round on
    /// @param newRound The round creation data
    /// @param assets Assets to deposit to the round
    function createAndFundRoundOnExistingHouse(
        address house,
        Round calldata newRound,
        Asset[] calldata assets
    ) external returns (address round) {
        if (!isHouse(house)) {
            revert INVALID_HOUSE();
        }
        if (!manager.isRoundRegistered(_getImpl(house), newRound.impl)) {
            revert INVALID_ROUND_IMPL_FOR_HOUSE();
        }

        round = _createRound(house, newRound);
        _batchDepositTo(msg.sender, payable(round), assets);

        IRound(round).initialize(newRound.config);
    }

    /// @notice Create a round on a new house
    /// @param newHouse The house creation data
    /// @param newRound The round creation data
    function createRoundOnNewHouse(House calldata newHouse, Round calldata newRound)
        external
        returns (address house, address round)
    {
        if (!manager.isHouseRegistered(newHouse.impl)) {
            revert INVALID_HOUSE_IMPL();
        }
        if (!manager.isRoundRegistered(newHouse.impl, newRound.impl)) {
            revert INVALID_ROUND_IMPL_FOR_HOUSE();
        }

        house = _createHouse(newHouse);
        round = _createRound(house, newRound);

        IRound(round).initialize(newRound.config);
    }

    /// @notice Create a round on a new house and deposit assets to the round
    /// @param newHouse The house creation data
    /// @param newRound The round creation data
    /// @param assets Assets to deposit to the round
    function createAndFundRoundOnNewHouse(
        House calldata newHouse,
        Round calldata newRound,
        Asset[] calldata assets
    ) external returns (address house, address round) {
        if (!manager.isHouseRegistered(newHouse.impl)) {
            revert INVALID_HOUSE_IMPL();
        }
        if (!manager.isRoundRegistered(newHouse.impl, newRound.impl)) {
            revert INVALID_ROUND_IMPL_FOR_HOUSE();
        }

        house = _createHouse(newHouse);
        round = _createRound(house, newRound);
        _batchDepositTo(msg.sender, payable(round), assets);

        IRound(round).initialize(newRound.config);
    }

    /// @notice Create and initialize a new house contract
    /// @param newHouse The house creation data
    function _createHouse(House memory newHouse) internal returns (address house) {
        house = newHouse.impl.clone();

        // Mint the ownership token to the house creator
        _mint(msg.sender, house.toUint256());

        emit HouseCreated(house, newHouse.impl);

        IHouse(house).initialize(newHouse.config);
    }

    /// @notice Create a new round and emit an event
    /// @param house The house address on which to create the round
    /// @param newRound The round creation data
    function _createRound(address house, Round calldata newRound) internal returns (address) {
        // TODO: Consider passing round title to write into contract
        address round = IHouse(house).createRound(newRound.impl, msg.sender);

        emit RoundCreated(house, round, newRound.impl, newRound.title, newRound.description);
        return round;
    }

    /// @notice Returns `true` if the passed `house` address is valid
    /// @param house The house address
    function isHouse(address house) public view returns (bool) {
        return exists(house.toUint256());
    }

    /// @notice Returns `true` if the passed `round` address is valid on any house
    /// @param round The round address
    function isRound(address round) public view returns (bool) {
        address house = IRound(round).house();

        return isHouse(house) && IHouse(house).isRound(round);
    }

    /// @notice Deposit an asset to the provided round
    /// @param user The user depositing the asset
    /// @param round The round address
    /// @param asset The asset to transfer to the round
    function _depositTo(
        address user,
        address payable round,
        Asset memory asset
    ) internal {
        uint256 etherRemaining = msg.value;

        // Reduce amount of remaining ether, if necessary
        if (asset.assetType == AssetType.Native) {
            // Ensure that sufficient native tokens are still available.
            if (asset.amount > etherRemaining) {
                revert INSUFFICIENT_ETHER_SUPPLIED();
            }
            // Skip underflow check as a comparison has just been made
            unchecked {
                etherRemaining -= asset.amount;
            }
        }

        _transfer(asset, user, round);

        // Mint deposit tokens to the caller. These are used to recoup assets in the event
        // of claim failure or cancellation.
        IRound(round).mintDepositTokens(user, _getAssetID(asset), asset.amount);

        // Return any remaining ether to the caller
        if (etherRemaining != 0) {
            _transferETH(payable(user), etherRemaining);
        }
    }

    /// @notice Deposit many assets to the provided round
    /// @param user The user depositing the assets
    /// @param round The round address
    /// @param assets The assets to transfer to the strategy
    function _batchDepositTo(
        address user,
        address payable round,
        Asset[] memory assets
    ) internal {
        uint256 assetCount = assets.length;

        uint256 etherRemaining = msg.value;

        uint256[] memory assetIds = new uint256[](assetCount);
        uint256[] memory assetAmounts = new uint256[](assetCount);
        for (uint256 i = 0; i < assetCount; ) {
            _transfer(assets[i], user, round);

            // Populate asset IDs and amounts in preparation for deposit token minting
            assetIds[i] = _getAssetID(assets[i]);
            assetAmounts[i] = assets[i].amount;

            // Reduce amount of remaining ether, if necessary
            if (assets[i].assetType == AssetType.Native) {
                // Ensure that sufficient native tokens are still available.
                if (assets[i].amount > etherRemaining) {
                    revert INSUFFICIENT_ETHER_SUPPLIED();
                }

                // Skip underflow check as a comparison has just been made
                unchecked {
                    etherRemaining -= assets[i].amount;
                }
            }

            unchecked {
                ++i;
            }
        }

        // Batch mint deposit tokens to the caller. These are used to recoup assets in the event
        // of claim failure or cancellation.
        IRound(round).batchMintDepositTokens(user, assetIds, assetAmounts);

        // Return any remaining ether to the caller
        if (etherRemaining != 0) {
            _transferETH(payable(user), etherRemaining);
        }
    }

    /// @notice Returns the implementation address for the provided `clone`
    /// @param clone The clone contract address
    function _getImpl(address clone) internal view returns (address impl) {
        assembly {
            extcodecopy(clone, 0x0, 0xB, 0x14)
            impl := shr(0x60, mload(0x0))
        }
    }
}
