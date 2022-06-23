// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Registrar Manager
interface IRegistrarManager {
    /// @notice Thrown when the caller of a guarded function is not the registrar
    error OnlyRegistrar();

    /// @notice Emitted when the registrar is updated
    /// @param registrar The address of the new registrar
    event RegistrarUpdated(address registrar);

    /// @notice The address of the active registrar
    function registrar() external view returns (address);
}
