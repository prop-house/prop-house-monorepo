// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Clone } from 'solady/src/utils/Clone.sol';
import { IHouse } from '../../interfaces/IHouse.sol';
import { IRound } from '../../interfaces/IRound.sol';
import { IPropHouse } from '../../interfaces/IPropHouse.sol';
import { IStarknetCore } from '../../interfaces/IStarknetCore.sol';
import { IMessenger } from '../../interfaces/IMessenger.sol';
import { Uint256 } from '../../lib/utils/Uint256.sol';
import { Selector } from '../../Constants.sol';

abstract contract Round is IRound, Clone {
    using { Uint256.toUint256 } for address;

    /// @notice The round type
    bytes32 public immutable kind;

    /// @notice The hash of the Starknet round contract
    uint256 public immutable classHash;

    /// @notice The entrypoint for all house and round creation
    IPropHouse public immutable propHouse;

    /// @notice The Starknet Core contract
    IStarknetCore public immutable starknet;

    /// @notice The Starknet Messenger contract
    IMessenger public immutable messenger;

    /// @notice The Round Factory contract address on Starknet
    uint256 internal immutable roundFactory;

    /// @notice The execution relayer contract on Starknet
    uint256 public immutable executionRelayer;

    /// @notice The merkle root that contains winner information. `bytes32(0)` if not finalized.
    bytes32 public winnerMerkleRoot;

    /// @notice Get the address of the house on which this strategy belongs
    /// @dev Value is read using clone-with-immutable-args from contract's code region.
    function house() public pure returns (address) {
        return _getArgAddress(0);
    }

    /// @notice Get the round title
    /// @dev Value is read using clone-with-immutable-args from contract's code region.
    function title() public pure returns (string memory) {
        return string(_getArgBytes(21, _getArgUint8(20)));
    }

    /// @notice Get the round ID
    function id() public view returns (uint256) {
        return address(this).toUint256();
    }

    /// @param _kind The round type
    /// @param _classHash The hash of the Starknet round contract
    /// @param _propHouse The entrypoint for all house and round creation
    /// @param _starknet The Starknet Core contract
    /// @param _messenger The Starknet Messenger contract
    /// @param _roundFactory The Round Factory contract address on Starknet
    /// @param _executionRelayer The execution relayer contract on Starknet
    constructor(bytes32 _kind, uint256 _classHash, address _propHouse, address _starknet, address _messenger, uint256 _roundFactory, uint256 _executionRelayer) {
        kind = _kind;
        classHash = _classHash;

        propHouse = IPropHouse(_propHouse);
        starknet = IStarknetCore(_starknet);
        messenger = IMessenger(_messenger);
        roundFactory = _roundFactory;
        executionRelayer = _executionRelayer;
    }

    /// @notice Require that the caller is the prop house contract
    modifier onlyPropHouse() {
        if (msg.sender != address(propHouse)) {
            revert ONLY_PROP_HOUSE();
        }
        _;
    }

    /// @notice Require that the caller is the round manager
    modifier onlyRoundManager() {
        if (msg.sender != IHouse(house()).ownerOf(id())) {
            revert ONLY_ROUND_MANAGER();
        }
        _;
    }

    /// @notice Route a call to the round contract on Starknet
    /// @param payload The payload to send to the round contract on Starknet
    function _callStarknetRound(uint256[] memory payload) internal {
        messenger.sendMessageToL2{ value: msg.value }(roundFactory, Selector.ROUTE_CALL_TO_ROUND, payload);
    }

    /// @notice Route a round cancellation to the round contract on Starknet
    function _cancelRound() internal {
        uint256[] memory payload = new uint256[](3);
        payload[1] = Selector.CANCEL_ROUND;

        _callStarknetRound(payload);
    }

    /// @notice Add strategies and parameters to the payload
    /// @param payload The payload to add to
    /// @param offset The starting offset index
    /// @param strategies The strategy addresses to add
    /// @param params The flattened parameters to add
    function _addStrategies(
        uint256[] memory payload,
        uint256 offset,
        uint256[] memory strategies,
        uint256[] memory params
    ) internal pure returns (uint256[] memory, uint256) {
        unchecked {
            uint256 strategyCount = strategies.length;
            uint256 paramCount = params.length;

            // Add strategy count
            payload[offset] = strategyCount;

            // Add strategies
            for (uint256 i = 0; i < strategyCount; ++i) {
                uint256 strategy = strategies[i];
                if (strategy == 0) {
                    revert INVALID_STRATEGY(strategy);
                }
                payload[++offset] = strategy;
            }

            // Add parameter count
            payload[++offset] = paramCount;

            // Add parameters
            for (uint256 i = 0; i < paramCount; ++i) {
                payload[++offset] = params[i];
            }
            return (payload, offset);
        }
    }
}
