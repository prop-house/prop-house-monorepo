// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { ERC20 } from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MockERC20 is ERC20 {
    constructor() ERC20('TEST_ERC20', 'TEST') {}

    function mint(address to, uint256 amount) public virtual {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public virtual {
        _burn(from, amount);
    }
}
