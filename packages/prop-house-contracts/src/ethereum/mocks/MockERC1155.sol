// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { ERC1155 } from '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract MockERC1155 is ERC1155 {
    constructor() ERC1155('') {}

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual {
        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual {
        _mintBatch(to, ids, amounts, data);
    }

    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) public virtual {
        _burn(from, id, amount);
    }

    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public virtual {
        _burnBatch(from, ids, amounts);
    }
}
