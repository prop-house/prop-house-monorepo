use core::dict::Felt252DictTrait;
use core::option::OptionTrait;
use prop_house::common::utils::merkle::{
    MerkleTree, MerkleTreeTrait, IncrementalMerkleTree, IncrementalMerkleTreeTrait
};
use array::{ArrayTrait, SpanTrait};
use integer::U128IntoFelt252;
use hash::LegacyHash;
use traits::Into;

#[test]
#[available_gas(100000000)]
fn keccak_merkle_tree_test() {
    let mut merkle_tree = MerkleTreeTrait::<u256>::new();

    let mut even_leaves = Default::<Array<u256>>::default();
    even_leaves.append(0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb);
    even_leaves.append(0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510);
    even_leaves.append(0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2);
    even_leaves.append(0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3);
    even_leaves.append(0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761);
    even_leaves.append(0xd1e8aeb79500496ef3dc2e57ba746a8315d048b7a664a2bf948db4fa91960483);

    let expected_merkle_root: u256 =
        0x9012f1e18a87790d2e01faace75aaaca38e53df437cdce2c0552464dda4af49c;
    test_case_compute_merkle_root(ref merkle_tree, even_leaves, expected_merkle_root);

    let mut odd_leaves = Default::<Array<u256>>::default();
    odd_leaves.append(0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb);
    odd_leaves.append(0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510);
    odd_leaves.append(0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2);
    odd_leaves.append(0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3);
    odd_leaves.append(0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761);
    odd_leaves.append(0xd1e8aeb79500496ef3dc2e57ba746a8315d048b7a664a2bf948db4fa91960483);
    odd_leaves.append(0x14bcc435f49d130d189737f9762feb25c44ef5b886bef833e31a702af6be4748);

    let expected_merkle_root: u256 =
        0x329bcb82b465308e4d3445408c794db388e401855b1fe6f2981c93ca34ce516b;
    test_case_compute_merkle_root(ref merkle_tree, odd_leaves, expected_merkle_root);

    // Create a proof.
    let proof = generate_proof_2_elements::<u256>(
        0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2,
        0x805b21d846b189efaeb0377d6bb0d201b3872a363e607c25088f025b0c6ae1f8,
    );

    let leaf = 0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3;

    let expected_proof_root = 0x68203f90e9d07dc5859259d7536e87a6ba9d345f2552b5b9de2999ddce9ce1bf;
    test_case_compute_proof_root(ref merkle_tree, proof, leaf, expected_proof_root);

    // Create a valid proof.
    let valid_proof = generate_proof_2_elements(
        0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2,
        0x805b21d846b189efaeb0377d6bb0d201b3872a363e607c25088f025b0c6ae1f8,
    );
    // Verify the proof is valid.
    test_case_verify(ref merkle_tree, expected_proof_root, leaf, valid_proof, true);

    // Create an invalid proof.
    let invalid_proof = generate_proof_2_elements(
        0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2 + 1,
        0x805b21d846b189efaeb0377d6bb0d201b3872a363e607c25088f025b0c6ae1f8,
    );

    // Verify the proof is invalid.
    test_case_verify(ref merkle_tree, expected_proof_root, leaf, invalid_proof, false);

    // Create a valid proof but we will pass a wrong leaf.
    let valid_proof = generate_proof_2_elements(
        0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2,
        0x805b21d846b189efaeb0377d6bb0d201b3872a363e607c25088f025b0c6ae1f8,
    );
    // Verify the proof is invalid when passed the wrong leaf to verify.
    test_case_verify(ref merkle_tree, expected_proof_root, leaf + 1, valid_proof, false);
}

#[test]
#[available_gas(2000000)]
fn pedersen_merkle_tree_test() {
    let mut merkle_tree = MerkleTreeTrait::<felt252>::new();
    // Create a proof.
    let proof = generate_proof_2_elements(
        275015828570532818958877094293872118179858708489648969448465143543997518327,
        3081470326846576744486900207655708080595997326743041181982939514729891127832
    );

    let leaf = 1743721452664603547538108163491160873761573033120794192633007665066782417603;
    let expected_proof_root =
        455571898402516024591265345720711356365422160584912150000578530706912124657;
    test_case_compute_proof_root(ref merkle_tree, proof, leaf, expected_proof_root);

    // Create a valid proof.
    let mut valid_proof = generate_proof_2_elements(
        275015828570532818958877094293872118179858708489648969448465143543997518327,
        3081470326846576744486900207655708080595997326743041181982939514729891127832
    );
    // Verify the proof is valid.
    test_case_verify(ref merkle_tree, expected_proof_root, leaf, valid_proof, true);

    // Create an invalid proof.
    let invalid_proof = generate_proof_2_elements(
        275015828570532818958877094293872118179858708489648969448465143543997518327 + 1,
        3081470326846576744486900207655708080595997326743041181982939514729891127832
    );
    // Verify the proof is invalid.
    test_case_verify(ref merkle_tree, expected_proof_root, leaf, invalid_proof, false);

    // Create a valid proof but we will pass a wrong leaf.
    let valid_proof = generate_proof_2_elements(
        275015828570532818958877094293872118179858708489648969448465143543997518327,
        3081470326846576744486900207655708080595997326743041181982939514729891127832
    );
    // Verify the proof is invalid when passed the wrong leaf to verify.
    test_case_verify(
        ref merkle_tree,
        expected_proof_root,
        1743721452664603547538108163491160873761573033120794192633007665066782417603 + 1,
        valid_proof,
        false
    );
}

#[test]
#[available_gas(100000000)]
fn keccak_incremental_merkle_tree_test() {
    let mut even_leaves = IncrementalMerkleTreeTrait::<u256>::new(
        10, // height
        0, // leaf count
        Default::default(), // sub-trees
    );

    even_leaves.append_leaf(0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb_u256);
    even_leaves.append_leaf(0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510_u256);
    even_leaves.append_leaf(0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2_u256);
    even_leaves.append_leaf(0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3_u256);
    even_leaves.append_leaf(0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761_u256);
    even_leaves.append_leaf(0xd1e8aeb79500496ef3dc2e57ba746a8315d048b7a664a2bf948db4fa91960483_u256);

    let expected_merkle_root: u256 = 0xdd9b7f68132d5e5199fd9aacaec183011f5ca6adef0736d37f0a069242791d31;
    let root: u256 = even_leaves.get_merkle_root().unwrap();
    assert(root == expected_merkle_root, 'wrong result');

    let mut odd_leaves = IncrementalMerkleTreeTrait::<u256>::new(
        10, // height
        0, // leaf count
        Default::default(), // sub-trees
    );

    odd_leaves.append_leaf(0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb_u256);
    odd_leaves.append_leaf(0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510_u256);
    odd_leaves.append_leaf(0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2_u256);
    odd_leaves.append_leaf(0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3_u256);
    odd_leaves.append_leaf(0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761_u256);
    odd_leaves.append_leaf(0xd1e8aeb79500496ef3dc2e57ba746a8315d048b7a664a2bf948db4fa91960483_u256);
    odd_leaves.append_leaf(0x14bcc435f49d130d189737f9762feb25c44ef5b886bef833e31a702af6be4748_u256);

    let expected_merkle_root: u256 = 0x6fd4e47817c250d7763c646043ba431df2ba617206283c121e6dce26ad311d1e;
    let root: u256 = odd_leaves.get_merkle_root().unwrap();
    assert(root == expected_merkle_root, 'wrong result');

    let mut full_tree = IncrementalMerkleTreeTrait::<u256>::new(
        2, // height
        0, // leaf count
        Default::default(), // sub-trees
    );

    full_tree.append_leaf(0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb_u256);
    full_tree.append_leaf(0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510_u256);
    full_tree.append_leaf(0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2_u256);
    full_tree.append_leaf(0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3_u256);

    let expected_merkle_root: u256 = 0x68203f90e9d07dc5859259d7536e87a6ba9d345f2552b5b9de2999ddce9ce1bf;
    let root: u256 = full_tree.get_merkle_root().unwrap();
    assert(root == expected_merkle_root, 'wrong result');

    let mut sub_tree_0 = Default::default();
    sub_tree_0.append(0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb_u256);
    sub_tree_0.append(0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510_u256);

    let mut sub_tree_1 = Default::default();
    sub_tree_1.append(0x805b21d846b189efaeb0377d6bb0d201b3872a363e607c25088f025b0c6ae1f8_u256);
    sub_tree_1.append(0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5_u256);

    let mut sub_trees = Default::<Felt252Dict<Nullable<Span<u256>>>>::default();
    sub_trees.insert(0, nullable_from_box(BoxTrait::new(sub_tree_0.span())));
    sub_trees.insert(1, nullable_from_box(BoxTrait::new(sub_tree_1.span())));

    let mut pre_populated_tree_even = IncrementalMerkleTreeTrait::<u256>::new(
        4, // height
        2, // leaf count
        sub_trees, // sub-trees
    );
    pre_populated_tree_even.append_leaf(0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2_u256);

    let expected_merkle_root: u256 = 0x5f977373dabeb815a2b219434449d9b71fbc68780486f5d5d0b2451f84f95df7;
    let root: u256 = pre_populated_tree_even.get_merkle_root().unwrap();
    assert(root == expected_merkle_root, 'wrong result');
}

#[test]
#[available_gas(100000000)]
#[should_panic(expected: ('Tree is full', ))]
fn keccak_incremental_merkle_tree_test_fail() {
    let mut full_tree = IncrementalMerkleTreeTrait::<u256>::new(
        2, // height
        0, // leaf count
        Default::default(), // sub-trees
    );

    full_tree.append_leaf(0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb_u256);
    full_tree.append_leaf(0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510_u256);
    full_tree.append_leaf(0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2_u256);
    full_tree.append_leaf(0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3_u256);

    full_tree.append_leaf(0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761_u256);
}

fn test_case_compute_merkle_root<
    T, impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>, impl TMerkleTree: MerkleTreeTrait<T>
>(
    ref merkle_tree: MerkleTree, leaves: Array<T>, expected_root: T
) {
    let mut merkle_tree = MerkleTreeTrait::<T>::new();
    let root = merkle_tree.compute_merkle_root(leaves.span());
    assert(root == expected_root, 'wrong result');
}

fn test_case_compute_proof_root<
    T, impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>, impl TMerkleTree: MerkleTreeTrait<T>
>(
    ref merkle_tree: MerkleTree, proof: Array<T>, leaf: T, expected_root: T
) {
    let mut merkle_tree = MerkleTreeTrait::<T>::new();
    let root = merkle_tree.compute_proof_root(leaf, proof.span());
    assert(root == expected_root, 'wrong result');
}

fn test_case_verify<
    T, impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>, impl TMerkleTree: MerkleTreeTrait<T>
>(
    ref merkle_tree: MerkleTree, root: T, leaf: T, proof: Array<T>, expected_result: bool
) {
    let result = merkle_tree.verify_proof(root, leaf, proof.span());
    assert(result == expected_result, 'wrong result');
}

fn generate_proof_2_elements<T, impl TDrop: Drop<T>>(element_1: T, element_2: T) -> Array<T> {
    let mut proof = Default::default();
    proof.append(element_1);
    proof.append(element_2);
    proof
}
