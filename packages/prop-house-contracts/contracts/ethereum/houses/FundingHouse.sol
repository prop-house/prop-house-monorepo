// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IPropHouse } from '../interfaces/IPropHouse.sol';
import { ICreatorPassRegistry } from '../interfaces/ICreatorPassRegistry.sol';
import { ITokenMetadataRenderer } from '../interfaces/ITokenMetadataRenderer.sol';
import { LibClone } from 'solady/src/utils/LibClone.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';
import { IHouse } from '../interfaces/IHouse.sol';
import { ERC721 } from '../lib/token/ERC721.sol';

contract FundingHouse is IHouse, ERC721 {
    using { Uint256.toUint256 } for address;
    using LibClone for address;

    /// @notice The entrypoint for all house and round creation
    IPropHouse public immutable propHouse;

    /// @notice The Asset Metadata Renderer contract
    ITokenMetadataRenderer public immutable renderer;

    /// @notice The round creator pass registry contract for all houses
    ICreatorPassRegistry public immutable creatorPassRegistry;

    /// @notice Require that the caller is the prop house contract
    modifier onlyPropHouse() {
        if (msg.sender != address(propHouse)) {
            revert ONLY_PROP_HOUSE();
        }
        _;
    }

    /// @notice Require that the caller holds the house ownership token
    modifier onlyHouseOwner() {
        if (msg.sender != propHouse.ownerOf(id())) {
            revert ONLY_HOUSE_OWNER();
        }
        _;
    }

    /// @param _propHouse The address of the house and round creation contract
    /// @param _renderer The funding house renderer contract address
    /// @param _creatorPassRegistry The address of the round creator pass registry contract
    constructor(
        address _propHouse,
        address _renderer,
        address _creatorPassRegistry
    ) {
        propHouse = IPropHouse(_propHouse);
        renderer = ITokenMetadataRenderer(_renderer);
        creatorPassRegistry = ICreatorPassRegistry(_creatorPassRegistry);
    }

    /// @notice Get the house ID
    function id() public view returns (uint256) {
        return address(this).toUint256();
    }

    /// @notice Initialize the house by populating token information
    /// @param data Initialization data
    function initialize(bytes calldata data) external initializer {
        if (data.length != 0) {
            // TODO: Allow these to be changed
            (string memory name, string memory symbol, string memory contractURI) = abi.decode(
                data,
                (string, string, string)
            );

            __ERC721_init(name, symbol, contractURI);
        }
    }

    /// @notice Returns round metadata for `tokenId` as a Base64-JSON blob
    /// @param tokenId The token ID
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return renderer.tokenURI(tokenId);
    }

    /// @notice Mint one or more round creator passes to the provided `creator`
    /// @param creator The address who will receive the round creator token(s)
    /// @param amount The amount of creator passes to mint
    /// @dev This function is only callable by the house owner
    function mintCreatorPassesTo(address creator, uint256 amount) external onlyHouseOwner {
        creatorPassRegistry.mintCreatorPassesTo(creator, amount);
    }

    /// @notice Burn one or more round creator passes from the provided `creator`
    /// @param creator The address to burn the creator pass(es) from
    /// @param amount The amount of creator passes to burn
    /// @dev This function is only callable by the house owner
    function burnCreatorPassesFrom(address creator, uint256 amount) external onlyHouseOwner {
        creatorPassRegistry.burnCreatorPassesFrom(creator, amount);
    }

    /// @notice Mint one or more round creator passes to many `creators`
    /// @param creators The addresses who will receive the round creator token(s)
    /// @param amounts The amount of creator passes to mint to each creator
    /// @dev This function is only callable by the house owner
    function mintCreatorPassesToMany(address[] calldata creators, uint256[] calldata amounts) external onlyHouseOwner {
        creatorPassRegistry.mintCreatorPassesToMany(creators, amounts);
    }

    // prettier-ignore
    /// @notice Burn one or more round creator passes from many `creators`
    /// @param creators The addresses to burn the creator pass(es) from
    /// @param amounts The amount of creator passes to burn from each creator
    /// @dev This function is only callable by the house owner
    function burnCreatorPassesFromMany(address[] calldata creators, uint256[] calldata amounts) external onlyHouseOwner {
        creatorPassRegistry.burnCreatorPassesFromMany(creators, amounts);
    }

    /// @notice Returns `true` if the provided address is a valid round on the house
    /// @param round The round to validate
    function isRound(address round) public view returns (bool) {
        return exists(round.toUint256());
    }

    /// @notice Create a new funding round and mint the round management NFT to the caller
    /// @param roundImpl The round implementation contract address
    /// @param creator The address who is creating the round
    function createRound(address roundImpl, address creator) external onlyPropHouse returns (address round) {
        // Revert if the creator does not hold a pass to create rounds on the house
        creatorPassRegistry.requirePass(creator, id());

        // Deploy the round contract with a pointer to the house
        round = roundImpl.clone(abi.encodePacked(address(this)));

        // Mint the management token to the round creator
        _mint(creator, round.toUint256());
    }
}
