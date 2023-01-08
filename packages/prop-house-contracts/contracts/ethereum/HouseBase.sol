// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IStrategyManager } from './interfaces/IStrategyManager.sol';
import { IUpgradeManager } from './interfaces/IUpgradeManager.sol';
import { IStarknetMessenger } from './interfaces/IStarknetMessenger.sol';
import { Ownable } from './lib/utils/Ownable.sol';
import { IHouse } from './interfaces/IHouse.sol';
import { UUPS } from './lib/proxy/UUPS.sol';

abstract contract HouseBase is IHouse, UUPS, Ownable {
    /// @notice The house implementation contract identifier
    bytes32 public immutable id;

    /// @notice The house implementation contract version
    uint256 public immutable version;

    /// @notice The Opt-In Upgrade Manager contract
    IUpgradeManager internal immutable _upgradeManager;

    /// @notice The Opt-In Strategy Manager contract
    IStrategyManager internal immutable _strategyManager;

    /// @notice The Starknet Messenger contract
    IStarknetMessenger internal immutable _messenger;

    /// @notice A URI that returns house-level metadata
    string public contractURI;

    /// @notice Determine if a house strategy is enabled
    mapping(address => bool) public isStrategyEnabled;

    /// @notice Require that the sender is a valid strategy for this house
    modifier onlyHouseStrategy() {
        if (!isValidHouseStrategy(msg.sender)) {
            revert ONLY_HOUSE_STRATEGY();
        }
        _;
    }

    constructor(
        string memory name_,
        uint256 version_,
        address upgradeManager_,
        address strategyManager_,
        address messenger_
    ) initializer {
        id = bytes32(bytes(name_));
        version = version_;

        _upgradeManager = IUpgradeManager(upgradeManager_);
        _strategyManager = IStrategyManager(strategyManager_);
        _messenger = IStarknetMessenger(messenger_);
    }

    /// @notice Update the contract URI
    /// @param newContractURI The new contract URI
    /// @dev This function is only callable by the house owner
    function updateContractURI(string calldata newContractURI) external onlyOwner {
        _updateContractURI(newContractURI);
    }

    /// @notice Enable a house strategy
    /// @param strategy The strategy to enable
    /// @dev This function is only callable by the house owner
    function enableStrategy(address strategy) external onlyOwner {
        _enableStrategy(strategy);
    }

    /// @notice Disable a house strategy
    /// @param strategy The strategy to disable
    /// @dev This function is only callable by the house owner
    function disableStrategy(address strategy) external onlyOwner {
        _disableStrategy(strategy);
    }

    /// @notice Enable many house strategies
    /// @param strategies The strategies to enable
    /// @dev This function is only callable by the house owner
    function enableManyStrategies(address[] calldata strategies) external onlyOwner {
        unchecked {
            uint256 numStrategies = strategies.length;
            for (uint256 i = 0; i < numStrategies; ++i) {
                _enableStrategy(strategies[i]);
            }
        }
    }

    /// @notice Disable many house strategies
    /// @param strategies The strategies to disable
    /// @dev This function is only callable by the house owner
    function disableManyStrategies(address[] calldata strategies) external onlyOwner {
        unchecked {
            uint256 numStrategies = strategies.length;
            for (uint256 i = 0; i < numStrategies; ++i) {
                _disableStrategy(strategies[i]);
            }
        }
    }

    /// @notice Returns `true` if the provided address is a valid house strategy
    /// @param strategy The house strategy to validate
    function isValidHouseStrategy(address strategy) public view virtual returns (bool);

    /// @notice Initialize the house
    /// @param creator The house creator
    function _initialize(address creator) internal {
        // Transfer ownership to the house creator
        __Ownable_init(creator);
    }

    // TODO: Can we do this 100% onchain. i.e. read the name, round count, etc and render nft as html page?
    // In which case, there would be no function to set or update. Should you be able to update the house name and description?

    /// @notice Update the contract URI
    /// @param newContractURI The new contract URI
    function _updateContractURI(string memory newContractURI) internal {
        contractURI = newContractURI;
        emit ContractURIUpdated(newContractURI);
    }

    /// @notice Enable a house strategy
    /// @param strategy The address of the strategy to enable
    function _enableStrategy(address strategy) internal {
        if (!_strategyManager.isValidStrategy(id, version, strategy)) {
            revert IStrategyManager.STRATEGY_NOT_REGISTERED();
        }
        isStrategyEnabled[strategy] = true;

        emit StrategyEnabled(strategy);
    }

    /// @notice Disable a house strategy
    /// @param strategy The address of the strategy to disable
    function _disableStrategy(address strategy) internal {
        _requireStrategyEnabled(strategy);
        isStrategyEnabled[strategy] = false;

        emit StrategyDisabled(strategy);
    }

    /// @notice Enable many house strategies
    /// @param strategies The addresses of the strategies to enable
    function _enableManyStrategies(address[] memory strategies) internal {
        unchecked {
            uint256 numStrategies = strategies.length;
            for (uint256 i = 0; i < numStrategies; ++i) {
                _enableStrategy(strategies[i]);
            }
        }
    }

    /// @notice Ensures the caller is authorized to upgrade the contract to a valid implementation
    /// @dev This function is called in UUPS `upgradeTo` & `upgradeToAndCall`
    /// @param newImpl The address of the new implementation
    function _authorizeUpgrade(address newImpl) internal override onlyOwner {
        if (!_upgradeManager.isValidUpgrade(_getImplementation(), newImpl)) {
            revert INVALID_UPGRADE(newImpl);
        }
    }

    /// @notice Revert is the strategy is not enabled on the house
    /// @param strategy The strategy address
    function _requireStrategyEnabled(address strategy) internal view {
        if (!isStrategyEnabled[strategy]) {
            revert STRATEGY_NOT_ENABLED();
        }
    }
}
