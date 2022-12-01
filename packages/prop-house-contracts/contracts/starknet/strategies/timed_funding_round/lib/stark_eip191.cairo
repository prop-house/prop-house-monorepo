%lang starknet

from starkware.starknet.common.syscalls import get_caller_address, get_contract_address
from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.math import assert_not_zero
from starkware.cairo.common.uint256 import uint256_eq, Uint256
from starkware.cairo.common.signature import verify_ecdsa_signature
from starkware.cairo.common.alloc import alloc

from contracts.starknet.common.lib.array_utils import ArrayUtils
from contracts.starknet.common.lib.felt_utils import FeltUtils

// Following a Starknet version of the EIP191 standard

// { name: 'prop-house', version: '1', chainId: '0x534e5f474f45524c49'} (chainID: SN_GOERLI)
const DOMAIN_HASH = 0xe555db13b92f041c987f35e960ce967667d7aa3095c901826b6191ab69ea6e;

const STARKNET_MESSAGE = 0x537461726b4e6574204d657373616765;

// print(get_selector_from_name("Propose(house_strategy:felt,proposer_address:felt,metadata_uri:felt*,salt:felt)"))
const PROPOSAL_TYPE_HASH = 0x44d93addcdbfc5b1f3f45d3425cdd57fd135eff6a1b7748ce6aa2f6ac081f1;

// print(get_selector_from_name("Vote(house_strategy:felt,voter_address:felt,proposal_votes_hash:felt,strategies_hash:felt,strategies_params_hash:felt,salt:felt)"))
const VOTE_TYPE_HASH = 0x2171fa7a357682500d2758586610c73eb1114a7257de59ff7d2bc03184bd8e1;

// print(get_selector_from_name("CancelProposal(house_strategy:felt,proposer_address:felt,proposal_id:felt,salt:felt)"))
const CANCEL_PROPOSAL_TYPE_HASH = 0x26ddb2d957b32296ccaa4486158f926acb3f1fae41d71894037acae90229863;

// print(get_selector_from_name("CancelRound(house_strategy:felt,round_initiator_address:felt,salt:felt)"))
const CANCEL_ROUND_TYPE_HASH = 0x3f1b8eb98c8ddf63acd6fbf71612667dd4553ac7d888c317fee48ac6a96acb9;

// print(get_selector_from_name("RevokeSessionKey(salt:felt)")
const REVOKE_SESSION_KEY_TYPE_HASH = 0x31F0BF4E2BBD12ECBA02E325F0EA3231350A638FC633AF8EBF244F50663ACE8;

// Maps a tuple of (user, salt) to a boolean stating whether this tuple was already used or not (to prevent replay attack).
@storage_var
func StarkEIP191_salts(user: felt, salt: felt) -> (already_used: felt) {
}

namespace StarkEIP191 {
    func verify_propose_sig{
        syscall_ptr: felt*,
        range_check_ptr,
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
    }(
        r: felt,
        s: felt,
        salt: felt,
        target: felt,
        calldata_len: felt,
        calldata: felt*,
        public_key: felt,
    ) {
        alloc_locals;

        let proposer_address = calldata[0];

        let (auth_strategy) = get_contract_address();

        // Ensure proposer has not already used this salt in a previous action
        let (already_used) = StarkEIP191_salts.read(proposer_address, salt);

        with_attr error_message("Salt already used") {
            assert already_used = 0;
        }

        // Metadata URI
        let metadata_uri_string_len = calldata[1];
        let metadata_uri_len = calldata[2];
        let metadata_uri: felt* = &calldata[3];
        let (metadata_uri_hash) = ArrayUtils.hash(metadata_uri_len, metadata_uri);

        let (structure: felt*) = alloc();

        assert structure[0] = PROPOSAL_TYPE_HASH;
        assert structure[1] = target;
        assert structure[2] = proposer_address;
        assert structure[3] = metadata_uri_hash;
        assert structure[4] = salt;

        let (hash_struct) = ArrayUtils.hash(5, structure);

        let (message: felt*) = alloc();

        assert message[0] = STARKNET_MESSAGE;
        assert message[1] = DOMAIN_HASH;
        assert message[2] = auth_strategy;
        assert message[3] = hash_struct;

        let (message_hash) = ArrayUtils.hash(4, message);

        verify_ecdsa_signature(message_hash, public_key, r, s);

        StarkEIP191_salts.write(proposer_address, salt, 1);

        return ();
    }

    func verify_vote_sig{
        syscall_ptr: felt*,
        range_check_ptr,
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
    }(
        r: felt,
        s: felt,
        salt: felt,
        target: felt,
        calldata_len: felt,
        calldata: felt*,
        public_key: felt,
    ) {
        alloc_locals;

        let voter_address = calldata[0];

        let (auth_strategy) = get_contract_address();

        // Ensure voter has not already used this salt in a previous action
        let (already_used) = StarkEIP191_salts.read(voter_address, salt);

        with_attr error_message("Salt already used") {
            assert already_used = 0;
        }

        let proposal_votes_len = calldata[1];
        let proposal_votes = &calldata[2];
        let (proposal_votes_hash) = ArrayUtils.hash(proposal_votes_len, proposal_votes);

        let used_voting_strategy_hash_indexes_len = calldata[2 + proposal_votes_len];
        let used_voting_strategy_hash_indexes = &calldata[3 + proposal_votes_len];
        let (used_voting_strategy_hash_indexes_hash) = ArrayUtils.hash(
            used_voting_strategy_hash_indexes_len, used_voting_strategy_hash_indexes
        );

        let user_voting_strategy_params_flat_len = calldata[3 + proposal_votes_len + used_voting_strategy_hash_indexes_len];
        let user_voting_strategy_params_flat = &calldata[4 + proposal_votes_len + used_voting_strategy_hash_indexes_len];
        let (user_voting_strategy_params_flat_hash) = ArrayUtils.hash(
            user_voting_strategy_params_flat_len, user_voting_strategy_params_flat
        );

        // Now construct the data hash (hashStruct)
        let (structure: felt*) = alloc();
        assert structure[0] = VOTE_TYPE_HASH;
        assert structure[1] = target;
        assert structure[2] = voter_address;
        assert structure[3] = proposal_votes_hash;
        assert structure[4] = used_voting_strategy_hash_indexes_hash;
        assert structure[5] = user_voting_strategy_params_flat_hash;
        assert structure[6] = salt;

        let (hash_struct) = ArrayUtils.hash(7, structure);

        let (message: felt*) = alloc();

        assert message[0] = STARKNET_MESSAGE;
        assert message[1] = DOMAIN_HASH;
        assert message[2] = auth_strategy;
        assert message[3] = hash_struct;

        let (message_hash) = ArrayUtils.hash(4, message);

        verify_ecdsa_signature(message_hash, public_key, r, s);

        StarkEIP191_salts.write(voter_address, salt, 1);

        return ();
    }

    func verify_cancel_proposal_sig{
        syscall_ptr: felt*,
        range_check_ptr,
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
    }(
        r: felt,
        s: felt,
        salt: felt,
        target: felt,
        calldata_len: felt,
        calldata: felt*,
        public_key: felt,
    ) {
        alloc_locals;

        let proposer_address = calldata[0];

        let (auth_strategy) = get_contract_address();

        // Ensure proposer has not already used this salt in a previous action
        let (already_used) = StarkEIP191_salts.read(proposer_address, salt);

        with_attr error_message("Salt already used") {
            assert already_used = 0;
        }

        let proposal_id = calldata[1];

        let (structure: felt*) = alloc();

        assert structure[0] = CANCEL_PROPOSAL_TYPE_HASH;
        assert structure[1] = target;
        assert structure[2] = proposer_address;
        assert structure[3] = proposal_id;
        assert structure[4] = salt;

        let (hash_struct) = ArrayUtils.hash(5, structure);

        let (message: felt*) = alloc();

        assert message[0] = STARKNET_MESSAGE;
        assert message[1] = DOMAIN_HASH;
        assert message[2] = auth_strategy;
        assert message[3] = hash_struct;

        let (message_hash) = ArrayUtils.hash(4, message);

        verify_ecdsa_signature(message_hash, public_key, r, s);

        StarkEIP191_salts.write(proposer_address, salt, 1);

        return ();
    }

    func verify_cancel_round_sig{
        syscall_ptr: felt*,
        range_check_ptr,
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
    }(
        r: felt,
        s: felt,
        salt: felt,
        target: felt,
        calldata_len: felt,
        calldata: felt*,
        public_key: felt,
    ) {
        alloc_locals;

        let round_initiator_address = calldata[0];

        let (auth_strategy) = get_contract_address();

        // Ensure round initiator has not already used this salt in a previous action
        let (already_used) = StarkEIP191_salts.read(round_initiator_address, salt);

        with_attr error_message("Salt already used") {
            assert already_used = 0;
        }

        let (structure: felt*) = alloc();

        assert structure[0] = CANCEL_ROUND_TYPE_HASH;
        assert structure[1] = target;
        assert structure[2] = round_initiator_address;
        assert structure[3] = salt;

        let (hash_struct) = ArrayUtils.hash(4, structure);

        let (message: felt*) = alloc();

        assert message[0] = STARKNET_MESSAGE;
        assert message[1] = DOMAIN_HASH;
        assert message[2] = auth_strategy;
        assert message[3] = hash_struct;

        let (message_hash) = ArrayUtils.hash(4, message);

        verify_ecdsa_signature(message_hash, public_key, r, s);

        StarkEIP191_salts.write(round_initiator_address, salt, 1);

        return ();
    }

    func verify_session_key_revoke_sig{
        syscall_ptr: felt*,
        range_check_ptr,
        pedersen_ptr: HashBuiltin*,
        ecdsa_ptr: SignatureBuiltin*,
    }(r: felt, s: felt, salt: felt, public_key: felt) {
        alloc_locals;

        let (auth_strategy) = get_contract_address();

        // Ensure voter has not already used this salt in a previous action
        let (already_used) = StarkEIP191_salts.read(public_key, salt);
        with_attr error_message("Salt already used") {
            assert already_used = 0;
        }

        // Now construct the data hash (hashStruct)
        let (structure: felt*) = alloc();
        assert structure[0] = REVOKE_SESSION_KEY_TYPE_HASH;
        assert structure[1] = salt;

        let (hash_struct) = ArrayUtils.hash(2, structure);

        let (message: felt*) = alloc();

        assert message[0] = STARKNET_MESSAGE;
        assert message[1] = DOMAIN_HASH;
        assert message[2] = auth_strategy;
        assert message[3] = hash_struct;

        let (message_hash) = ArrayUtils.hash(4, message);

        verify_ecdsa_signature(message_hash, public_key, r, s);

        StarkEIP191_salts.write(public_key, salt, 1);

        return ();
    }
}
