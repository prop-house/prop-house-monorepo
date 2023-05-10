use prop_house::common::utils::merkle::{MerkleTree, MerkleTreeTrait};
use integer::U128IntoFelt252;
use array::ArrayTrait;
use hash::LegacyHash;
use traits::Into;

#[test]
#[available_gas(100000000)]
fn keccak_merkle_tree_test() {
    let mut merkle_tree = MerkleTreeTrait::<u256>::new();

    let mut even_leaves = ArrayTrait::<u256>::new();
    even_leaves.append(0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb);
    even_leaves.append(0xb5553de315e0edf504d9150af82dafa5c4667fa618ed0a6f19c69b41166c5510);
    even_leaves.append(0x0b42b6393c1f53060fe3ddbfcd7aadcca894465a5a438f69c87d790b2299b9b2);
    even_leaves.append(0xf1918e8562236eb17adc8502332f4c9c82bc14e19bfc0aa10ab674ff75b3d2f3);
    even_leaves.append(0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761);
    even_leaves.append(0xd1e8aeb79500496ef3dc2e57ba746a8315d048b7a664a2bf948db4fa91960483);

    let expected_merkle_root: u256 =
        0x9012f1e18a87790d2e01faace75aaaca38e53df437cdce2c0552464dda4af49c;
    test_case_compute_merkle_root(ref merkle_tree, even_leaves, expected_merkle_root);

    let mut odd_leaves = ArrayTrait::<u256>::new();
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
    let mut proof = ArrayTrait::new();
    proof.append(element_1);
    proof.append(element_2);
    proof
}
