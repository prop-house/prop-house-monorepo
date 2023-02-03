// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { ERC1155Supply } from './lib/token/ERC1155Supply.sol';
import { ICreatorPassRegistry } from './interfaces/ICreatorPassRegistry.sol';
import { ITokenMetadataRenderer } from './interfaces/ITokenMetadataRenderer.sol';
import { IPropHouse } from './interfaces/IPropHouse.sol';
import { Uint256 } from './lib/utils/Uint256.sol';
import { IHouse } from './interfaces/IHouse.sol';

contract CreatorPassRegistry is ICreatorPassRegistry, ERC1155Supply {
    using { Uint256.toUint256 } for address;

    /// @notice The entrypoint for all house and round creation
    IPropHouse public immutable propHouse;

    /// @notice The Asset Metadata Renderer contract
    ITokenMetadataRenderer public immutable renderer;

    /// @notice Require that the caller is a valid house
    modifier onlyHouse() {
        if (!propHouse.isHouse(msg.sender)) {
            revert ONLY_HOUSE();
        }
        _;
    }

    /// @param _propHouse The address of the prop house entrypoint contract
    /// @param _renderer The creator pass registry renderer contract address
    constructor(address _propHouse, address _renderer) {
        propHouse = IPropHouse(_propHouse);
        renderer = ITokenMetadataRenderer(_renderer);
    }

    /// @notice Returns the deposit token URI for the provided token ID
    /// @param tokenId The creator pass token ID
    function uri(uint256 tokenId) public view override returns (string memory) {
        return renderer.tokenURI(tokenId);
    }

    /// @notice Determine if the provided `creator` holds a pass with the id `id`
    /// @param creator The creator address
    /// @param id The house ID
    function holdsPass(address creator, uint256 id) public view returns (bool) {
        return balanceOf[creator][id] != 0;
    }

    /// @notice Revert if the passed `creator` does not hold a pass with the id `id`
    /// @param creator The creator address
    /// @param id The house ID
    function requirePass(address creator, uint256 id) external view {
        if (!holdsPass(creator, id)) {
            revert CREATOR_HOLDS_NO_PASS();
        }
    }

    /// @notice Mint one or more round creator passes to the provided `creator`
    /// @param creator The address who will receive the round creator token(s)
    /// @param amount The amount of creator passes to mint
    /// @dev This function is only callable by valid houses
    function mintCreatorPassesTo(address creator, uint256 amount) external onlyHouse {
        _mint(creator, _callingHouseId(), amount, new bytes(0));
    }

    /// @notice Burn one or more round creator passes from the provided `creator`
    /// @param creator The address to burn the creator pass(es) from
    /// @param amount The amount of creator passes to burn
    /// @dev This function is only callable by valid houses
    function burnCreatorPassesFrom(address creator, uint256 amount) external onlyHouse {
        _burn(creator, _callingHouseId(), amount);
    }

    /// @notice Mint one or more round creator passes to many `creators`
    /// @param creators The addresses who will receive the round creator token(s)
    /// @param amounts The amount of creator passes to mint to each creator
    /// @dev This function is only callable by valid houses
    function mintCreatorPassesToMany(address[] calldata creators, uint256[] calldata amounts) external onlyHouse {
        uint256 creatorCount = creators.length;
        if (creatorCount != amounts.length) {
            revert LENGTH_MISMATCH();
        }

        uint256 id = _callingHouseId();
        for (uint256 i = 0; i < creatorCount; ) {
            _mint(creators[i], id, amounts[i], new bytes(0));

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Burn one or more round creator passes from many `creators`
    /// @param creators The addresses to burn the creator pass(es) from
    /// @param amounts The amount of creator passes to burn from each creator
    /// @dev This function is only callable by valid houses
    function burnCreatorPassesFromMany(address[] calldata creators, uint256[] calldata amounts) external onlyHouse {
        uint256 creatorCount = creators.length;
        if (creatorCount != amounts.length) {
            revert LENGTH_MISMATCH();
        }

        uint256 id = _callingHouseId();
        for (uint256 i = 0; i < creatorCount; ) {
            _burn(creators[i], id, amounts[i]);

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Return the ID of the calling house
    function _callingHouseId() internal view returns (uint256) {
        return msg.sender.toUint256();
    }
}
