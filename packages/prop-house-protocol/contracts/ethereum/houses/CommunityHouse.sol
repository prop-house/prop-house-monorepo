// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IPropHouse } from '../interfaces/IPropHouse.sol';
import { ICreatorPassIssuer } from '../interfaces/ICreatorPassIssuer.sol';
import { ITokenMetadataRenderer } from '../interfaces/ITokenMetadataRenderer.sol';
import { LibClone } from 'solady/src/utils/LibClone.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';
import { IHouse } from '../interfaces/IHouse.sol';
import { ERC721 } from '../lib/token/ERC721.sol';
import { CHMetadata } from '../Constants.sol';

/// @notice The community house is designed for teams who want to create rounds under a single organization
contract CommunityHouse is IHouse, ERC721 {
    using { Uint256.toUint256 } for address;
    using LibClone for address;

    /// @notice The house type
    bytes32 public immutable kind;

    /// @notice The entrypoint for all house and round creation
    IPropHouse public immutable propHouse;

    /// @notice The Asset Metadata Renderer contract
    ITokenMetadataRenderer public immutable renderer;

    /// @notice The round creator pass issuer contract for all houses
    ICreatorPassIssuer public immutable creatorPassIssuer;

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
    /// @param _renderer The community house renderer contract address
    /// @param _creatorPassIssuer The address of the round creator pass issuer contract
    constructor(
        address _propHouse,
        address _renderer,
        address _creatorPassIssuer
    ) ERC721(CHMetadata.NAME, CHMetadata.SYMBOL) {
        kind = CHMetadata.TYPE;

        propHouse = IPropHouse(_propHouse);
        renderer = ITokenMetadataRenderer(_renderer);
        creatorPassIssuer = ICreatorPassIssuer(_creatorPassIssuer);
    }

    /// @notice Get the house ID
    function id() public view returns (uint256) {
        return address(this).toUint256();
    }

    /// @notice Initialize the house
    /// @param data Initialization data
    function initialize(bytes calldata data) external onlyPropHouse {
        if (data.length != 0) {
            _setContractURI(abi.decode(data, (string)));
        }
    }

    /// @notice Returns round metadata for `tokenId` as a Base64-JSON blob
    /// @param tokenId The token ID
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return renderer.tokenURI(tokenId);
    }

    /// @dev Updates the contract URI
    /// @param _contractURI The new contract URI
    /// @dev This function is only callable by the house owner
    function setContractURI(string memory _contractURI) external onlyHouseOwner {
        _setContractURI(_contractURI);
    }

    /// @notice Issue one or more round creator passes to the provided `creator`
    /// @param creator The address who will receive the round creator token(s)
    /// @param amount The amount of creator passes to issue
    /// @dev This function is only callable by the house owner
    function issueCreatorPassesTo(address creator, uint256 amount) external onlyHouseOwner {
        creatorPassIssuer.issueCreatorPassesTo(creator, amount);
    }

    /// @notice Revoke one or more round creator passes from the provided `creator`
    /// @param creator The address to revoke the creator pass(es) from
    /// @param amount The amount of creator passes to revoke
    /// @dev This function is only callable by the house owner
    function revokeCreatorPassesFrom(address creator, uint256 amount) external onlyHouseOwner {
        creatorPassIssuer.revokeCreatorPassesFrom(creator, amount);
    }

    /// @notice Issue one or more round creator passes to many `creators`
    /// @param creators The addresses who will receive the round creator token(s)
    /// @param amounts The amount of creator passes to issue to each creator
    /// @dev This function is only callable by the house owner
    function issueCreatorPassesToMany(address[] calldata creators, uint256[] calldata amounts) external onlyHouseOwner {
        creatorPassIssuer.issueCreatorPassesToMany(creators, amounts);
    }

    // prettier-ignore
    /// @notice Revoke one or more round creator passes from many `creators`
    /// @param creators The addresses to revoke the creator pass(es) from
    /// @param amounts The amount of creator passes to revoke from each creator
    /// @dev This function is only callable by the house owner
    function revokeCreatorPassesFromMany(address[] calldata creators, uint256[] calldata amounts) external onlyHouseOwner {
        creatorPassIssuer.revokeCreatorPassesFromMany(creators, amounts);
    }

    /// @notice Returns `true` if the provided address is a valid round on the house
    /// @param round The round to validate
    function isRound(address round) public view returns (bool) {
        return exists(round.toUint256());
    }

    /// @notice Create a new round and mint the round management NFT to the caller
    /// @param roundImpl The round implementation contract address
    /// @param roundTitle The round title
    /// @param creator The address who is creating the round
    function createRound(
        address roundImpl,
        string calldata roundTitle,
        address creator
    ) external onlyPropHouse returns (address round) {
        // Revert if the creator is not the house owner and does not hold a creator pass
        if (creator != propHouse.ownerOf(id())) {
            creatorPassIssuer.requirePass(creator, id());
        }

        // Deploy the round contract with a pointer to the house
        round = roundImpl.clone(abi.encodePacked(address(this), _toUint8(bytes(roundTitle).length), roundTitle));

        // Mint the management token to the round creator
        _mint(creator, round.toUint256());
    }

    /// @notice Cast a `uint256` value to `uint8`, reverting if the value is too large to fit
    /// @param value The value to cast to `uint8`
    function _toUint8(uint256 value) internal pure returns (uint8) {
        if (value > type(uint8).max) {
            revert VALUE_DOES_NOT_FIT_IN_8_BITS();
        }
        return uint8(value);
    }
}
