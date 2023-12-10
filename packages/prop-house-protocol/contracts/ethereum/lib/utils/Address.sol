// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @title Address
/// @notice Modified from Rohan Kulkarni's work for Nouns Builder
/// Originally modified from OpenZeppelin Contracts v4.7.3 (utils/Address.sol)
/// - Uses custom errors
/// - Adds util converting address to bytes32
library Address {
    /// @dev Thrown when the target of a delegatecall is not a contract
    error INVALID_TARGET();

    /// @dev Thrown when a delegatecall has failed
    error DELEGATE_CALL_FAILED();

    /// @dev If an address is a contract
    function isContract(address _account) internal view returns (bool rv) {
        assembly {
            rv := gt(extcodesize(_account), 0)
        }
    }

    /// @dev Performs a delegatecall on an address
    function functionDelegateCall(address _target, bytes memory _data) internal returns (bytes memory) {
        if (!isContract(_target)) revert INVALID_TARGET();

        (bool success, bytes memory returndata) = _target.delegatecall(_data);

        return verifyCallResult(success, returndata);
    }

    /// @dev Verifies a delegatecall was successful
    function verifyCallResult(bool _success, bytes memory _returndata) internal pure returns (bytes memory) {
        if (_success) {
            return _returndata;
        } else {
            if (_returndata.length > 0) {
                assembly {
                    let returndata_size := mload(_returndata)

                    revert(add(32, _returndata), returndata_size)
                }
            } else {
                revert DELEGATE_CALL_FAILED();
            }
        }
    }
}
