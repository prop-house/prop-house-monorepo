// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IRegistrarManager } from '../interfaces/IRegistrarManager.sol';

/// @title RegistrarManager
/// @notice This contract allows the registrar to update itself for many contracts in one call
contract RegistrarManager is IRegistrarManager {
    /// @notice The address of the registrar
    address public registrar;

    /// @notice Require that the sender is the registrar
    modifier onlyRegistrar() {
        if (msg.sender != registrar) {
            revert OnlyRegistrar();
        }
        _;
    }

    /// @param _registrar The address of the registrar
    constructor(address _registrar) {
        registrar = _registrar;
    }

    /// @notice Updates the registrar
    /// @param _registrar The address of the new registrar
    function setRegistrar(address _registrar) external onlyRegistrar {
        registrar = _registrar;

        emit RegistrarUpdated(registrar);
    }
}
