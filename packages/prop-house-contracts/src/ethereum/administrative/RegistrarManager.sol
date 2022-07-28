// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IRegistrarManager } from '../interfaces/IRegistrarManager.sol';

/// @title RegistrarManager
/// @notice This contract is the source of truth for the active registrar
contract RegistrarManager is IRegistrarManager {
    /// @notice The address of the nominated registrar
    address public nominatedRegistrar;

    /// @notice The address of the active registrar
    address public registrar;

    /// @notice Require that the sender is the nominated registrar
    modifier onlyNominatedRegistrar() {
        if (msg.sender != nominatedRegistrar) {
            revert OnlyNominatedRegistrar();
        }
        _;
    }

    /// @notice Require that the sender is the active registrar
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

    /// @notice Update the nominated registrar
    /// @param _nominatedRegistrar The address of the nominated registrar
    function setNominatedRegistrar(address _nominatedRegistrar) external onlyRegistrar {
        nominatedRegistrar = _nominatedRegistrar;

        emit NominatedRegistrarUpdated(registrar);
    }

    /// @notice Accept the registrar nomination
    function acceptRegistrarNomination() external onlyNominatedRegistrar {
        registrar = nominatedRegistrar;
        nominatedRegistrar = address(0);

        emit RegistrarUpdated(registrar);
    }
}
