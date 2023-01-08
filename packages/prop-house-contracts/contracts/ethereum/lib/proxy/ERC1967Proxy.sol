// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Proxy } from '@openzeppelin/contracts/proxy/Proxy.sol';

import { IERC1967Upgrade } from '../../interfaces/IERC1967Upgrade.sol';
import { ERC1967Upgrade } from './ERC1967Upgrade.sol';

/// @title ERC1967Proxy
/// @notice Modified from Rohan Kulkarni's work for Nouns Builder
/// Originally modified from OpenZeppelin Contracts v4.7.3 (proxy/ERC1967/ERC1967Proxy.sol)
/// - Inherits a modern, minimal ERC1967Upgrade
contract ERC1967Proxy is IERC1967Upgrade, Proxy, ERC1967Upgrade {
    /// @dev Initializes the proxy with an implementation contract and encoded function call
    /// @param logic The implementation address
    /// @param data The encoded function call
    constructor(address logic, bytes memory data) payable {
        _upgradeToAndCall(logic, data, false);
    }

    /// @dev The address of the current implementation
    function _implementation() internal view virtual override returns (address) {
        return ERC1967Upgrade._getImplementation();
    }
}
