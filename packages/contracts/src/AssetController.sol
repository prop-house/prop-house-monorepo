// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@solady/tokens/ERC20.sol";

library AssetController {
    struct Asset {
        address assetType;
        address tokenAddress;
        uint256 amount;
    }

    function transfer(Asset calldata asset, address from, address to) internal {
        if (asset.assetType == address(0)) {
            payable(to).transfer(asset.amount);
        } else {
            ERC20(asset.tokenAddress).transferFrom(from, to, asset.amount);
        }
    }

    function balanceOf(Asset calldata asset, address owner) internal view returns (uint256) {
        if (asset.assetType == address(0)) {
            return owner.balance;
        } else {
            return ERC20(asset.tokenAddress).balanceOf(owner);
        }
    }

    function approveERC20(address token, address spender, uint256 amount) internal {
        ERC20(token).approve(spender, amount);
    }
}
