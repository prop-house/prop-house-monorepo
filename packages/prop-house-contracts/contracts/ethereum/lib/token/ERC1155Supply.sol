// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { ERC1155 } from './ERC1155.sol';

// Issue if minting on house strategy contracts - This is expensive AF.

/// @notice Extension of ERC1155 that adds tracking of total supply per id.
abstract contract ERC1155Supply is ERC1155 {
    error BURN_AMOUNT_EXCEEDS_TOTAL_SUPPLY();

    mapping(uint256 => uint256) private _totalSupply;

    /// @dev Total amount of tokens in with a given id.
    function totalSupply(uint256 id) public view virtual returns (uint256) {
        return _totalSupply[id];
    }

    /// @dev Indicates whether any token exist with a given id, or not.
    function exists(uint256 id) public view virtual returns (bool) {
        return ERC1155Supply.totalSupply(id) > 0;
    }

    /// @dev See {ERC1155-_beforeTokenTransfer}.
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        if (from == address(0)) {
            for (uint256 i = 0; i < ids.length; ++i) {
                _totalSupply[ids[i]] += amounts[i];
            }
        }

        if (to == address(0)) {
            for (uint256 i = 0; i < ids.length; ++i) {
                uint256 id = ids[i];
                uint256 amount = amounts[i];
                uint256 supply = _totalSupply[id];
                if (amount > supply) {
                    revert BURN_AMOUNT_EXCEEDS_TOTAL_SUPPLY();
                }
                unchecked {
                    _totalSupply[id] = supply - amount;
                }
            }
        }
    }
}
