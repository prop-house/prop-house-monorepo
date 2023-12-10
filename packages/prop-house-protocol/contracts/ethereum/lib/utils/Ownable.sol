// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IOwnable } from '../../interfaces/IOwnable.sol';
import { Initializable } from './Initializable.sol';

/// @title Ownable
/// @notice Modified from Rohan Kulkarni's work for Nouns Builder
/// Originally Modified from OpenZeppelin Contracts v4.7.3 (access/OwnableUpgradeable.sol)
/// - Uses custom errors declared in IOwnable
/// - Adds optional two-step ownership transfer (`safeTransferOwnership` + `acceptOwnership`)
abstract contract Ownable is IOwnable, Initializable {
    /// @dev The address of the owner
    address internal _owner;

    /// @dev The address of the pending owner
    address internal _pendingOwner;

    /// @dev Ensures the caller is the owner
    modifier onlyOwner() {
        if (msg.sender != _owner) revert ONLY_OWNER();
        _;
    }

    /// @dev Ensures the caller is the pending owner
    modifier onlyPendingOwner() {
        if (msg.sender != _pendingOwner) revert ONLY_PENDING_OWNER();
        _;
    }

    /// @dev Initializes contract ownership
    /// @param initialOwner The initial owner address
    function __Ownable_init(address initialOwner) internal onlyInitializing {
        _owner = initialOwner;

        emit OwnerUpdated(address(0), initialOwner);
    }

    /// @notice The address of the owner
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /// @notice The address of the pending owner
    function pendingOwner() public view returns (address) {
        return _pendingOwner;
    }

    /// @notice Forces an ownership transfer from the last owner
    /// @param newOwner The new owner address
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /// @notice Forces an ownership transfer from any sender
    /// @param newOwner New owner to transfer contract to
    /// @dev Ensure is called only from trusted internal code, no access control checks.
    function _transferOwnership(address newOwner) internal {
        emit OwnerUpdated(_owner, newOwner);

        _owner = newOwner;

        if (_pendingOwner != address(0)) delete _pendingOwner;
    }

    /// @notice Initiates a two-step ownership transfer
    /// @param newOwner The new owner address
    function safeTransferOwnership(address newOwner) public onlyOwner {
        _pendingOwner = newOwner;

        emit OwnerPending(_owner, newOwner);
    }

    /// @notice Accepts an ownership transfer
    function acceptOwnership() public onlyPendingOwner {
        emit OwnerUpdated(_owner, msg.sender);

        _owner = _pendingOwner;

        delete _pendingOwner;
    }

    /// @notice Cancels a pending ownership transfer
    function cancelOwnershipTransfer() public onlyOwner {
        emit OwnerCanceled(_owner, _pendingOwner);

        delete _pendingOwner;
    }
}
