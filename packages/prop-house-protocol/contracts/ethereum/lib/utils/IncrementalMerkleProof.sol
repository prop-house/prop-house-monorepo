// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @notice Incremental merkle proof verification library
library IncrementalMerkleProof {
    function verify(
        bytes32[] calldata proofSiblings,
        uint8[] calldata proofPathIndices,
        uint256 depth,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool isValid) {
        if (proofPathIndices.length != depth || proofSiblings.length != depth) {
            // Length of path is not correct
            return false;
        }

        bytes32 hash = leaf;
        for (uint8 i = 0; i < depth; ) {
            if (proofPathIndices[i] != 1 && proofPathIndices[i] != 0) {
                // Path index is neither 0 nor 1
                return false;
            }

            if (proofPathIndices[i] == 0) {
                hash = keccak256(abi.encodePacked(hash, proofSiblings[i]));
            } else {
                hash = keccak256(abi.encodePacked(proofSiblings[i], hash));
            }

            unchecked {
                ++i;
            }
        }
        return hash == root;
    }
}
