// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IncrementalTreeProof } from '../types/Common.sol';

/// @notice Incremental merkle proof verification library
library IncrementalMerkleProof {
    function verify(
        IncrementalTreeProof memory proof,
        uint256 depth,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool isValid) {
        if (proof.pathIndices.length != depth || proof.siblings.length != depth) {
            // Length of path is not correct
            return false;
        }

        bytes32 _hash = leaf;
        for (uint8 i = 0; i < depth; ) {
            if (proof.pathIndices[i] != 1 && proof.pathIndices[i] != 0) {
                // Path index is neither 0 nor 1
                return false;
            }

            if (proof.pathIndices[i] == 0) {
                _hash = keccak256(abi.encodePacked(_hash, proof.siblings[i]));
            } else {
                _hash = keccak256(abi.encodePacked(proof.siblings[i], _hash));
            }

            unchecked {
                ++i;
            }
        }
        return _hash == root;
    }
}
