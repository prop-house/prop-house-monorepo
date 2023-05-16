use prop_house::common::utils::hash::keccak_uint256s_be_to_be;
use array::{ArrayTrait, SpanTrait};
use integer::u256_from_felt252;
use option::OptionTrait;
use hash::LegacyHash;
use traits::Into;

/// MerkleTree representation.
#[derive(Drop)]
struct MerkleTree {}

/// MerkleTree trait.
trait MerkleTreeTrait<T> {
    /// Create a new merkle tree instance.
    fn new() -> MerkleTree;
    /// Compute the merkle root of the tree.
    fn compute_merkle_root(ref self: MerkleTree, leaves: Span<T>) -> T;
    /// Compute the merkle root of a given proof.
    fn compute_proof_root(ref self: MerkleTree, current_node: T, proof: Span<T>) -> T;
    /// Verify a merkle proof.
    fn verify_proof(ref self: MerkleTree, root: T, leaf: T, proof: Span<T>) -> bool;
}

/// KeccakMerkleTree implementation.
impl KeccakMerkleTreeImpl of MerkleTreeTrait<u256> {
    /// Create a new merkle tree instance.
    #[inline(always)]
    fn new() -> MerkleTree {
        MerkleTree {}
    }

    /// Compute the merkle root of the tree.
    /// * `leaves` - The leaves of the tree.
    fn compute_merkle_root(ref self: MerkleTree, mut leaves: Span<u256>) -> u256 {
        loop {
            if leaves.len() == 1 {
                break *leaves.at(0);
            }

            let mut next_level_nodes = ArrayTrait::<u256>::new();
            leaves = loop {
                match leaves.pop_front() {
                    Option::Some(left) => {
                        let left = *left;

                        match leaves.pop_front() {
                            Option::Some(right) => {
                                let right = *right;

                                let mut hash_input = ArrayTrait::<u256>::new();
                                if left < right {
                                    hash_input.append(left);
                                    hash_input.append(right);
                                } else {
                                    hash_input.append(right);
                                    hash_input.append(left);
                                }
                                next_level_nodes.append(keccak_uint256s_be_to_be(hash_input.span()));
                            },
                            Option::None(_) => {
                                next_level_nodes.append(left);
                                continue;
                            },
                        };
                    },
                    Option::None(_) => {
                        break next_level_nodes.span();
                    },
                };
            };
        }
    }

    /// Compute the merkle root of a given proof.
    /// * `current_node` - The current node of the proof.
    /// * `proof` - The proof.
    fn compute_proof_root(
        ref self: MerkleTree, mut current_node: u256, mut proof: Span<u256>
    ) -> u256 {
        let mut current_node = current_node;
        loop {
            match proof.pop_front() {
                Option::Some(proof_element) => {
                    let proof_element = *proof_element;
                    let mut node_input = ArrayTrait::new();

                    // Compute the hash of the current node and the current element of the proof.
                    // We need to check if the current node is smaller than the current element of the proof.
                    // If it is, we need to swap the order of the hash.
                    if current_node < proof_element {
                        node_input.append(current_node);
                        node_input.append(proof_element);
                    } else {
                        node_input.append(proof_element);
                        node_input.append(current_node);
                    }
                    current_node = keccak_uint256s_be_to_be(node_input.span());
                },
                Option::None(_) => {
                    break current_node;
                },
            };
        }
    }

    /// Verify a merkle proof.
    /// * `root` - The merkle root.
    /// * `leaf` - The leaf to verify.
    /// * `proof` - The proof.
    fn verify_proof(ref self: MerkleTree, root: u256, leaf: u256, mut proof: Span<u256>) -> bool {
        let computed_root = self.compute_proof_root(leaf, proof);
        computed_root == root
    }
}

/// PedersenMerkleTree implementation.
impl PedersenMerkleTreeImpl of MerkleTreeTrait<felt252> {
    /// Create a new merkle tree instance.
    #[inline(always)]
    fn new() -> MerkleTree {
        MerkleTree {}
    }

    /// Compute the merkle root of the tree.
    /// * `leaves` - The leaves of the tree.
    fn compute_merkle_root(ref self: MerkleTree, mut leaves: Span<felt252>) -> felt252 {
        panic_with_felt252('Not implemented')
    }

    /// Compute the merkle root of a given proof.
    /// * `current_node` - The current node of the proof.
    /// * `proof` - The proof.
    fn compute_proof_root(
        ref self: MerkleTree, mut current_node: felt252, mut proof: Span<felt252>
    ) -> felt252 {
        let mut current_node = current_node;
        loop {
            match proof.pop_front() {
                Option::Some(proof_element) => {
                    let proof_element = *proof_element;
                    let mut node_input = ArrayTrait::<felt252>::new();

                    // Compute the hash of the current node and the current element of the proof.
                    // We need to check if the current node is smaller than the current element of the proof.
                    // If it is, we need to swap the order of the hash.
                    if u256_from_felt252(current_node) < u256_from_felt252(proof_element) {
                        current_node = LegacyHash::hash(current_node, proof_element);
                    } else {
                        current_node = LegacyHash::hash(proof_element, current_node);
                    }
                },
                Option::None(_) => {
                    break current_node;
                },
            };
        }
    }

    /// Verify a merkle proof.
    /// * `root` - The merkle root.
    /// * `leaf` - The leaf to verify.
    /// * `proof` - The proof.
    fn verify_proof(
        ref self: MerkleTree, root: felt252, leaf: felt252, mut proof: Span<felt252>
    ) -> bool {
        let computed_root = self.compute_proof_root(leaf, proof);
        computed_root == root
    }
}
