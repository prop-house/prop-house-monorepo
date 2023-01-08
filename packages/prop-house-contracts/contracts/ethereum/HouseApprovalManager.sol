// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IHouseFactory } from './interfaces/IHouseFactory.sol';
import { IHouseApprovalManager } from './interfaces/IHouseApprovalManager.sol';

contract HouseApprovalManager is IHouseApprovalManager {
    // prettier-ignore
    /// @notice The EIP-712 type for a signed approval
    /// @dev keccak256("SignedApproval(address house,address user,bool approved,uint256 deadline,uint256 nonce)")
    bytes32 private constant SIGNED_APPROVAL_TYPEHASH = 0x3b4dace373ad1cafd792be798d1508dcf2212c32278d14e0836dbe7eed6a978e;

    // prettier-ignore
    /// @notice The EIP-712 domain separator
    bytes32 private immutable EIP_712_DOMAIN_SEPARATOR = keccak256(
        abi.encode(
            keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
            keccak256(bytes('PROP_HOUSE')),
            keccak256(bytes('1')),
            _chainID(),
            address(this)
        )
    );

    /// @notice The House Factory contract
    IHouseFactory public immutable factory;

    /// @notice Determine if a user has given a house permission to pull assets
    /// @dev User Address => House Address => Is Approved
    mapping(address => mapping(address => bool)) public isHouseApproved;

    /// @notice The signature nonces for 3rd party house approvals
    mapping(address => uint256) public sigNonces;

    constructor(IHouseFactory _factory) {
        factory = _factory;
    }

    /// @notice Updates a house approval for the caller
    /// @param house The house address
    /// @param approved Whether the user is adding or removing approval
    function setApprovalForHouse(address house, bool approved) external {
        _setApprovalForHouse(msg.sender, house, approved);
    }

    /// @notice Sets approval for a house given an EIP-712 signature
    /// @param user The user to approve the house for
    /// @param house The house to approve
    /// @param approved A boolean, whether or not to approve a house
    /// @param deadline The deadline at which point the given signature expires
    /// @param v The 129th byte and chain ID of the signature
    /// @param r The first 64 bytes of the signature
    /// @param s Bytes 64-128 of the signature
    function setApprovalForHouseBySig(
        address user,
        address house,
        bool approved,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        if (deadline != 0 && block.timestamp > deadline) {
            revert EXPIRED_SIGNATURE();
        }

        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                EIP_712_DOMAIN_SEPARATOR,
                keccak256(abi.encode(SIGNED_APPROVAL_TYPEHASH, house, user, approved, deadline, sigNonces[user]++))
            )
        );

        address recoveredAddress = ecrecover(digest, v, r, s);
        if (recoveredAddress == address(0) || recoveredAddress != user) {
            revert INVALID_SIGNATURE();
        }
        _setApprovalForHouse(user, house, approved);
    }

    /// @notice Updates a house approval for a user
    /// @param user The user address
    /// @param house The house address
    /// @param approved Whether the user is adding or removing approval
    function _setApprovalForHouse(
        address user,
        address house,
        bool approved
    ) internal {
        if (!factory.isHouse(house)) {
            revert INVALID_HOUSE();
        }
        isHouseApproved[user][house] = approved;

        emit HouseApprovalSet(user, house, approved);
    }

    /// @notice The EIP-155 chain id
    function _chainID() private view returns (uint256 id) {
        assembly {
            id := chainid()
        }
    }
}
