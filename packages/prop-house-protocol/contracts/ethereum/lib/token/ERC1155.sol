// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.17;

import { ERC1155TokenReceiver } from '../utils/TokenReceiver.sol';
import { IERC1155 } from '../../interfaces/IERC1155.sol';

/// @notice Minimalist and gas efficient standard ERC1155 implementation.
/// @author Modified from Solmate (https://github.com/transmissions11/solmate/blob/main/src/tokens/ERC1155.sol)
/// - Uses custom errors
/// - Does not revert on `_mint` & `_batchMint` if the receiver is a contract and does NOT implement the ERC1155TokenReceiver rules
abstract contract ERC1155 is IERC1155 {
    mapping(address => mapping(uint256 => uint256)) public balanceOf;

    mapping(address => mapping(address => bool)) public isApprovedForAll;

    function uri(uint256 id) public view virtual returns (string memory);

    function setApprovalForAll(address operator, bool approved) public virtual {
        isApprovedForAll[msg.sender][operator] = approved;

        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) public virtual {
        if (msg.sender != from && !isApprovedForAll[from][msg.sender]) {
            revert NOT_AUTHORIZED();
        }

        uint256[] memory ids = _asSingletonArray(id);
        uint256[] memory amounts = _asSingletonArray(amount);

        _beforeTokenTransfer(msg.sender, from, to, ids, amounts, data);

        balanceOf[from][id] -= amount;
        balanceOf[to][id] += amount;

        emit TransferSingle(msg.sender, from, to, id, amount);

        // prettier-ignore
        if (to.code.length == 0 ? to == address(0) : ERC1155TokenReceiver(to).onERC1155Received(msg.sender, from, id, amount, data) != ERC1155TokenReceiver.onERC1155Received.selector) {
            revert UNSAFE_RECIPIENT();
        }
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) public virtual {
        if (ids.length != amounts.length) {
            revert LENGTH_MISMATCH();
        }
        if (msg.sender != from && !isApprovedForAll[from][msg.sender]) {
            revert NOT_AUTHORIZED();
        }

        _beforeTokenTransfer(msg.sender, from, to, ids, amounts, data);

        // Storing these outside the loop saves ~15 gas per iteration.
        uint256 id;
        uint256 amount;

        for (uint256 i = 0; i < ids.length; ) {
            id = ids[i];
            amount = amounts[i];

            balanceOf[from][id] -= amount;
            balanceOf[to][id] += amount;

            // An array can't have a total length
            // larger than the max uint256 value.
            unchecked {
                ++i;
            }
        }

        emit TransferBatch(msg.sender, from, to, ids, amounts);

        // prettier-ignore
        if (to.code.length == 0 ? to == address(0) : ERC1155TokenReceiver(to).onERC1155BatchReceived(msg.sender, from, ids, amounts, data) != ERC1155TokenReceiver.onERC1155BatchReceived.selector) {
            revert UNSAFE_RECIPIENT();
        }
    }

    function balanceOfBatch(
        address[] calldata owners,
        uint256[] calldata ids
    ) public view virtual returns (uint256[] memory balances) {
        if (owners.length != ids.length) {
            revert LENGTH_MISMATCH();
        }

        balances = new uint256[](owners.length);

        // Unchecked because the only math done is incrementing
        // the array index counter which cannot possibly overflow.
        unchecked {
            for (uint256 i = 0; i < owners.length; ++i) {
                balances[i] = balanceOf[owners[i]][ids[i]];
            }
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165 Interface ID for ERC165
            interfaceId == 0xd9b67a26 || // ERC165 Interface ID for ERC1155
            interfaceId == 0x0e89341c; // ERC165 Interface ID for ERC1155MetadataURI
    }

    function _mint(address to, uint256 id, uint256 amount, bytes memory data) internal virtual {
        uint256[] memory ids = _asSingletonArray(id);
        uint256[] memory amounts = _asSingletonArray(amount);

        _beforeTokenTransfer(msg.sender, address(0), to, ids, amounts, data);

        balanceOf[to][id] += amount;

        emit TransferSingle(msg.sender, address(0), to, id, amount);

        if (to.code.length == 0) {
            if (to == address(0)) {
                revert UNSAFE_RECIPIENT();
            }
        } else {
            // prettier-ignore
            try ERC1155TokenReceiver(to).onERC1155Received(msg.sender, address(0), id, amount, data) returns (bytes4 response) {
                // `to` supports `ERC1155TokenReceiver`. Revert if an unexpected response is received.
                if (response != ERC1155TokenReceiver.onERC1155Received.selector) {
                    revert UNSAFE_RECIPIENT();
                }
            } catch {
                // We MUST check if `to` supports `ERC1155TokenReceiver`. If not, we take a less restrictive approach than
                // most implementations and do NOT revert. According to the spec, this is valid behavior.
                try ERC1155TokenReceiver(to).supportsInterface(0x4e2312e0 /* `ERC1155TokenReceiver` support */) returns (bool supported) {
                    if (supported) {
                        revert UNSAFE_RECIPIENT();
                    }
                } catch {}
            }
        }
    }

    function _batchMint(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        uint256 idsLength = ids.length; // Saves MLOADs.

        if (idsLength != amounts.length) {
            revert LENGTH_MISMATCH();
        }

        _beforeTokenTransfer(msg.sender, address(0), to, ids, amounts, data);

        for (uint256 i = 0; i < idsLength; ) {
            balanceOf[to][ids[i]] += amounts[i];

            // An array can't have a total length
            // larger than the max uint256 value.
            unchecked {
                ++i;
            }
        }

        emit TransferBatch(msg.sender, address(0), to, ids, amounts);

        if (to.code.length == 0) {
            if (to == address(0)) {
                revert UNSAFE_RECIPIENT();
            }
        } else {
            // prettier-ignore
            try ERC1155TokenReceiver(to).onERC1155BatchReceived(msg.sender, address(0), ids, amounts, data) returns (bytes4 response) {
                // `to` supports `ERC1155TokenReceiver`. Revert if an unexpected response is received.
                if (response != ERC1155TokenReceiver.onERC1155BatchReceived.selector) {
                    revert UNSAFE_RECIPIENT();
                }
            } catch {
                // We MUST check if `to` supports `ERC1155TokenReceiver`. If not, we take a less restrictive approach than
                // most implementations and do NOT revert. According to the spec, this is valid behavior.
                try ERC1155TokenReceiver(to).supportsInterface(0x4e2312e0 /* `ERC1155TokenReceiver` support */) returns (bool supported) {
                    if (supported) {
                        revert UNSAFE_RECIPIENT();
                    }
                } catch {}
            }
        }
    }

    function _batchBurn(address from, uint256[] memory ids, uint256[] memory amounts) internal virtual {
        uint256 idsLength = ids.length; // Saves MLOADs.

        if (idsLength != amounts.length) {
            revert LENGTH_MISMATCH();
        }

        _beforeTokenTransfer(msg.sender, from, address(0), ids, amounts, '');

        for (uint256 i = 0; i < idsLength; ) {
            balanceOf[from][ids[i]] -= amounts[i];

            // An array can't have a total length
            // larger than the max uint256 value.
            unchecked {
                ++i;
            }
        }

        emit TransferBatch(msg.sender, from, address(0), ids, amounts);
    }

    function _burn(address from, uint256 id, uint256 amount) internal virtual {
        uint256[] memory ids = _asSingletonArray(id);
        uint256[] memory amounts = _asSingletonArray(amount);

        _beforeTokenTransfer(msg.sender, from, address(0), ids, amounts, '');

        balanceOf[from][id] -= amount;

        emit TransferSingle(msg.sender, from, address(0), id, amount);
    }

    function _asSingletonArray(uint256 element) private pure returns (uint256[] memory array) {
        array = new uint256[](1);
        array[0] = element;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {}
}
