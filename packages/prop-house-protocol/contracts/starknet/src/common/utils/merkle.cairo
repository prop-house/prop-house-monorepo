use prop_house::common::utils::hash::keccak_u256s_be;
use prop_house::common::utils::math::pow;
use nullable::{NullableTrait, nullable_from_box};
use integer::{u256_from_felt252, U32IntoU128};
use array::{ArrayTrait, SpanTrait};
use dict::Felt252DictTrait;
use option::OptionTrait;
use hash::LegacyHash;
use box::BoxTrait;
use traits::Into;

/// Pre-computed zero hashes for the first 10 levels of a keccak incremental merkle tree.
mod KeccakZeroHashes {
    const Z_0: u256 = 0x0;
    const Z_1: u256 = 0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5;
    const Z_2: u256 = 0xb4c11951957c6f8f642c4af61cd6b24640fec6dc7fc607ee8206a99e92410d30;
    const Z_3: u256 = 0x21ddb9a356815c3fac1026b6dec5df3124afbadb485c9ba5a3e3398a04b7ba85;
    const Z_4: u256 = 0xe58769b32a1beaf1ea27375a44095a0d1fb664ce2dd358e7fcbfb78c26a19344;
    const Z_5: u256 = 0xeb01ebfc9ed27500cd4dfc979272d1f0913cc9f66540d7e8005811109e1cf2d;
    const Z_6: u256 = 0x887c22bd8750d34016ac3c66b5ff102dacdd73f6b014e710b51e8022af9a1968;
    const Z_7: u256 = 0xffd70157e48063fc33c97a050f7f640233bf646cc98d9524c6b92bcf3ab56f83;
    const Z_8: u256 = 0x9867cc5f7f196b93bae1e27e6320742445d290f2263827498b54fec539f756af;
    const Z_9: u256 = 0xcefad4e508c098b9a7e1d8feb19955fb02ba9675585078710969d3440f5054e0;
}

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

            let mut next_level_nodes = Default::<Array<u256>>::default();
            leaves = loop {
                match leaves.pop_front() {
                    Option::Some(left) => {
                        let left = *left;

                        match leaves.pop_front() {
                            Option::Some(right) => {
                                let right = *right;

                                let mut hash_input = Default::<Array<u256>>::default();
                                if left < right {
                                    hash_input.append(left);
                                    hash_input.append(right);
                                } else {
                                    hash_input.append(right);
                                    hash_input.append(left);
                                }
                                next_level_nodes.append(keccak_u256s_be(hash_input.span()));
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
                    let mut node_input = Default::default();

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
                    current_node = keccak_u256s_be(node_input.span());
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
                    let mut node_input = Default::<Array<felt252>>::default();

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

/// IncrementalMerkleTree representation.
#[derive(Destruct)]
struct IncrementalMerkleTree {
    depth: u32,
    max_leaves: u32,
    zeroes: Span<u256>,
    current_leaf_count: u32,
    sub_trees: Felt252Dict<Nullable<Span<u256>>>,
    merkle_root: Option<u256>,
}

/// IncrementalMerkleTree trait.
trait IncrementalMerkleTreeTrait {
    /// Create a new IncrementalMerkleTree instance.
    fn new(depth: u32, current_leaf_count: u32, sub_trees: Felt252Dict<Nullable<Span<u256>>>) -> IncrementalMerkleTree;
    /// Add a leaf to the merkle tree.
    fn append_leaf(ref self: IncrementalMerkleTree, leaf: u256) -> u256;
    /// Get the current depth of the tree.
    fn get_current_depth(ref self: IncrementalMerkleTree) -> u32;
    /// Get the merkle root of the tree.
    fn get_merkle_root(ref self: IncrementalMerkleTree) -> Option<u256>;
}

/// Pre-computed keccak zero hashes.
fn _get_keccak_zero_hashes() -> Span<u256> {
    let mut zeroes = Default::default();
    zeroes.append(KeccakZeroHashes::Z_0);
    zeroes.append(KeccakZeroHashes::Z_1);
    zeroes.append(KeccakZeroHashes::Z_2);
    zeroes.append(KeccakZeroHashes::Z_3);
    zeroes.append(KeccakZeroHashes::Z_4);
    zeroes.append(KeccakZeroHashes::Z_5);
    zeroes.append(KeccakZeroHashes::Z_6);
    zeroes.append(KeccakZeroHashes::Z_7);
    zeroes.append(KeccakZeroHashes::Z_8);
    zeroes.append(KeccakZeroHashes::Z_9);

    zeroes.span()
}

/// Compute the root of an incremental merkle tree using the current sub-trees and other state.
/// * `sub_trees` - The sub-trees of the merkle tree.
/// * `hash` - The current hash.
/// * `size` - The current size of the tree.
/// * `max_depth` - The maximum depth of the tree.
/// * `zeroes` - The pre-computed zero hashes.
fn _compute_root(ref sub_trees: Felt252Dict<Nullable<Span<u256>>>, mut hash: u256, mut size: u32, max_depth: felt252, zeroes: Span<u256>) -> u256 {
    let mut curr_depth = 0;

    loop {
        if curr_depth.into() == max_depth {
            break;
        }
        let mut sub_tree = Default::default();
        if (size.into() & 1_u128) == 0 {
            sub_tree.append(hash);
            sub_tree.append(*zeroes.at(curr_depth));
        } else {
            sub_tree.append(*sub_trees.get(curr_depth.into()).deref().at(0));
            sub_tree.append(hash);
        }
        let sub_tree = sub_tree.span();
        
        sub_trees.insert(curr_depth.into(), nullable_from_box(BoxTrait::new(sub_tree)));
        hash = keccak_u256s_be(sub_tree);

        size /= 2;
        curr_depth += 1;
    };
    hash
}

/// KeccakIncrementalMerkleTree implementation.
impl KeccakIncrementalMerkleTreeImpl of IncrementalMerkleTreeTrait {
    /// Create a new incremental merkle tree instance.
    fn new(depth: u32, current_leaf_count: u32, sub_trees: Felt252Dict<Nullable<Span<u256>>>) -> IncrementalMerkleTree {
        let max_leaves = pow(2, depth);

        assert(depth <= 10, 'Depth must be <= 10');
        assert(current_leaf_count <= max_leaves, 'Leaf count must be <= 2^depth');        

        IncrementalMerkleTree {
            depth,
            max_leaves,
            sub_trees,
            current_leaf_count,
            zeroes: _get_keccak_zero_hashes(),
            merkle_root: Option::None(()),
        }
    }

    /// Append a leaf to the merkle tree.
    /// * `leaf` - The leaf to append.
    fn append_leaf(ref self: IncrementalMerkleTree, leaf: u256) -> u256 {
        assert(self.current_leaf_count < self.max_leaves, 'Tree is full');

        self.merkle_root = Option::Some(_compute_root(ref self.sub_trees, leaf, self.current_leaf_count, self.depth.into(), self.zeroes));
        self.current_leaf_count += 1;

        self.merkle_root.unwrap()
    }

    /// Get the current depth of the tree.
    fn get_current_depth(ref self: IncrementalMerkleTree) -> u32 {
        let mut size = self.current_leaf_count;
        let mut current_depth = 0;
        loop {
            if size <= 1 {
                break current_depth;
            }
            size = (size + 1) / 2;
            current_depth += 1;
        }
    }

    /// Get the merkle root of the tree.
    /// Note that the root will be empty until a leaf is appended.
    /// This is true even when tree is initialized with existing state.
    fn get_merkle_root(ref self: IncrementalMerkleTree) -> Option<u256> {
        self.merkle_root
    }
}
