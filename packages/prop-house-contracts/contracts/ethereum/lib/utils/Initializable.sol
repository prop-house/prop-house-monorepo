// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IInitializable } from '../../interfaces/IInitializable.sol';
import { Address } from './Address.sol';

/// @title Initializable
/// @notice Modified from Rohan Kulkarni's work for Nouns Builder
/// Originally modified from OpenZeppelin Contracts v4.7.3 (proxy/utils/Initializable.sol)
/// - Uses custom errors declared in IInitializable
abstract contract Initializable is IInitializable {
    /// @dev Indicates the contract has been initialized
    uint8 internal _initialized;

    /// @dev Indicates the contract is being initialized
    bool internal _initializing;

    /// @dev Ensures an initialization function is only called within an `initializer` or `reinitializer` function
    modifier onlyInitializing() {
        if (!_initializing) revert NotInitializing();
        _;
    }

    /// @dev Enables initializing upgradeable contracts
    modifier initializer() {
        bool isTopLevelCall = !_initializing;

        if ((!isTopLevelCall || _initialized != 0) && (Address.isContract(address(this)) || _initialized != 1))
            revert AlreadyInitialized();

        _initialized = 1;

        if (isTopLevelCall) {
            _initializing = true;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;

            emit Initialized(1);
        }
    }

    /// @dev Enables initializer versioning
    /// @param version The version to set
    modifier reinitializer(uint8 version) {
        if (_initializing || _initialized >= version) revert AlreadyInitialized();

        _initialized = version;

        _initializing = true;

        _;

        _initializing = false;

        emit Initialized(version);
    }

    /// @dev Prevents future initialization
    function _disableInitializers() internal virtual {
        if (_initializing) revert Initializing();

        if (_initialized < type(uint8).max) {
            _initialized = type(uint8).max;

            emit Initialized(type(uint8).max);
        }
    }
}
