use prop_house::common::utils::merkle::{MerkleTree, MerkleTreeTrait};
use prop_house::common::utils::u256::as_u256;
use array::ArrayTrait;
use hash::LegacyHash;

#[test]
#[available_gas(100000000)]
fn keccak_merkle_tree_test() {
    let mut merkle_tree = MerkleTreeTrait::<u256>::new();
    // Create a proof.
    let proof = generate_proof_2_elements(
        as_u256(14967895479457470500441594449402441164, 224080190154071229201179410017478621618),
        as_u256(170614368929274506575238042249581351425, 238633627480230985864261636119568507384),
    );

    let leaf = as_u256(
        321099720698533974410729766622034087068, 173776214784247125837757018433490506483, 
    );

    let expected_merkle_root = as_u256(
        138407154334126855173707271541493761958, 248052660046310084497349233485165683135, 
    );
    test_case_compute_root(ref merkle_tree, proof, leaf, expected_merkle_root);

    // Create a valid proof.
    let valid_proof = generate_proof_2_elements(
        as_u256(14967895479457470500441594449402441164, 224080190154071229201179410017478621618),
        as_u256(170614368929274506575238042249581351425, 238633627480230985864261636119568507384),
    );
    // Verify the proof is valid.
    test_case_verify(ref merkle_tree, expected_merkle_root, leaf, valid_proof, true);

    // Create an invalid proof.
    let invalid_proof = generate_proof_2_elements(
        as_u256(14967895479457470500441594449402441164, 224080190154071229201179410017478621618)
            + as_u256(0, 1),
        as_u256(170614368929274506575238042249581351425, 238633627480230985864261636119568507384),
    );

    // Verify the proof is invalid.
    test_case_verify(ref merkle_tree, expected_merkle_root, leaf, invalid_proof, false);

    // Create a valid proof but we will pass a wrong leaf.
    let valid_proof = generate_proof_2_elements(
        as_u256(14967895479457470500441594449402441164, 224080190154071229201179410017478621618),
        as_u256(170614368929274506575238042249581351425, 238633627480230985864261636119568507384),
    );
    // Verify the proof is invalid when passed the wrong leaf to verify.
    test_case_verify(
        ref merkle_tree, expected_merkle_root, leaf + as_u256(0, 1), valid_proof, false
    );
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
    let expected_merkle_root =
        455571898402516024591265345720711356365422160584912150000578530706912124657;
    test_case_compute_root(ref merkle_tree, proof, leaf, expected_merkle_root);

    // Create a valid proof.
    let mut valid_proof = generate_proof_2_elements(
        275015828570532818958877094293872118179858708489648969448465143543997518327,
        3081470326846576744486900207655708080595997326743041181982939514729891127832
    );
    // Verify the proof is valid.
    test_case_verify(ref merkle_tree, expected_merkle_root, leaf, valid_proof, true);

    // Create an invalid proof.
    let invalid_proof = generate_proof_2_elements(
        275015828570532818958877094293872118179858708489648969448465143543997518327 + 1,
        3081470326846576744486900207655708080595997326743041181982939514729891127832
    );
    // Verify the proof is invalid.
    test_case_verify(ref merkle_tree, expected_merkle_root, leaf, invalid_proof, false);

    // Create a valid proof but we will pass a wrong leaf.
    let valid_proof = generate_proof_2_elements(
        275015828570532818958877094293872118179858708489648969448465143543997518327,
        3081470326846576744486900207655708080595997326743041181982939514729891127832
    );
    // Verify the proof is invalid when passed the wrong leaf to verify.
    test_case_verify(
        ref merkle_tree,
        expected_merkle_root,
        1743721452664603547538108163491160873761573033120794192633007665066782417603 + 1,
        valid_proof,
        false
    );
}

fn test_case_compute_root<T,
impl TDrop: Drop<T>,
impl TPartialEq: PartialEq<T>,
impl TMerkleTree: MerkleTreeTrait<T>>(
    ref merkle_tree: MerkleTree, proof: Array<T>, leaf: T, expected_root: T
) {
    let mut merkle_tree = MerkleTreeTrait::<T>::new();
    let root = merkle_tree.compute_root(leaf, proof.span());
    assert(root == expected_root, 'wrong result');
}

fn test_case_verify<T,
impl TDrop: Drop<T>,
impl TPartialEq: PartialEq<T>,
impl TMerkleTree: MerkleTreeTrait<T>>(
    ref merkle_tree: MerkleTree, root: T, leaf: T, proof: Array<T>, expected_result: bool
) {
    let result = merkle_tree.verify(root, leaf, proof.span());
    assert(result == expected_result, 'wrong result');
}

fn generate_proof_2_elements<T, impl TDrop: Drop<T>>(element_1: T, element_2: T) -> Array<T> {
    let mut proof = ArrayTrait::new();
    proof.append(element_1);
    proof.append(element_2);
    proof
}
