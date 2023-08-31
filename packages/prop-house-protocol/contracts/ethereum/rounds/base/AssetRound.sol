// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Round } from './Round.sol';
import { IERC165 } from '../../interfaces/IERC165.sol';
import { AssetHelper } from '../../lib/utils/AssetHelper.sol';
import { IAssetRound } from '../../interfaces/IAssetRound.sol';
import { AssetController } from '../../lib/utils/AssetController.sol';
import { ITokenMetadataRenderer } from '../../interfaces/ITokenMetadataRenderer.sol';
import { DepositReceiver } from '../../lib/utils/DepositReceiver.sol';
import { TokenHolder } from '../../lib/utils/TokenHolder.sol';
import { ERC1155 } from '../../lib/token/ERC1155.sol';
import { Asset } from '../../lib/types/Common.sol';

abstract contract AssetRound is IAssetRound, Round, AssetController, TokenHolder, ERC1155, DepositReceiver {
    using { AssetHelper.toID } for Asset;

    /// @notice The Asset Metadata Renderer contract
    ITokenMetadataRenderer public immutable renderer;

    /// @notice Determine if a winner has claimed their award asset
    /// @dev Proposal IDs map to bits in the uint256 mapping
    mapping(uint256 => uint256) private _assetClaimStatus;

    constructor(
        bytes32 _kind,
        uint256 _classHash,
        address _propHouse,
        address _starknet,
        address _messenger,
        uint256 _roundFactory,
        uint256 _executionRelayer,
        address _renderer
    ) Round(_kind, _classHash, _propHouse, _starknet, _messenger, _roundFactory, _executionRelayer) {
        renderer = ITokenMetadataRenderer(_renderer);
    }

    /// @notice Returns the deposit token URI for the provided token ID
    /// @param tokenId The deposit token ID
    function uri(uint256 tokenId) external view override returns (string memory) {
        return renderer.tokenURI(tokenId);
    }

    // prettier-ignore
    /// @notice If the contract implements an interface
    /// @param interfaceId The interface id
    function supportsInterface(bytes4 interfaceId) public view virtual override(DepositReceiver, TokenHolder, ERC1155, IERC165) returns (bool) {
        return DepositReceiver.supportsInterface(interfaceId) || TokenHolder.supportsInterface(interfaceId) || ERC1155.supportsInterface(interfaceId);
    }

    /// @notice Issue a deposit receipt
    /// @param depositor The depositor address
    /// @param id The token identifier
    /// @param amount The token amount
    /// @dev This function is only callable by the prop house contract
    function onDepositReceived(address depositor, uint256 id, uint256 amount) external onlyPropHouse {
        _mint(depositor, id, amount, new bytes(0));
    }

    /// @notice Issue deposit receipts
    /// @param depositor The depositor address
    /// @param ids The token identifiers
    /// @param amounts The token amounts
    /// @dev This function is only callable by the prop house contract
    function onDepositsReceived(
        address depositor,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external onlyPropHouse {
        _batchMint(depositor, ids, amounts, new bytes(0));
    }

    /// @notice Determine whether an asset has been claimed for a specific proposal ID
    /// @param proposalId The proposal ID
    function isClaimed(uint256 proposalId) public view returns (bool claimed) {
        uint256 isBitSet = (_assetClaimStatus[proposalId >> 8] >> (proposalId & 0xff)) & 1;
        assembly {
            claimed := isBitSet
        }
    }

    /// @notice Reclaim assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param assets The assets to reclaim
    function _reclaimTo(address recipient, Asset[] calldata assets) internal {
        uint256 assetCount = assets.length;
        address caller = msg.sender;

        for (uint256 i = 0; i < assetCount; ) {
            uint256 assetId = assets[i].toID();

            // Burn deposit credits. This will revert if the caller does not have enough credits.
            _burn(caller, assetId, assets[i].amount);

            // Transfer the asset to the recipient
            _transfer(assets[i], address(this), payable(recipient));

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Mark an asset as 'claimed' for the provided proposal ID
    /// @param proposalId The winning proposal ID
    function _setClaimed(uint256 proposalId) internal {
        _assetClaimStatus[proposalId >> 8] |= (1 << (proposalId & 0xff));
    }
}
