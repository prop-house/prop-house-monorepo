use core::zeroable::Zeroable;
use starknet::ContractAddress;

#[abi]
trait IEthereumSigAuthStrategy {
    fn authenticate(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        target: ContractAddress,
        selector: felt252,
        cdata: Array<felt252>,
    );
}

#[contract]
mod EthereumSigAuthStrategy {
    use starknet::{ContractAddress, get_contract_address, call_contract_syscall};
    use prop_house::rounds::timed_funding::constants::{DomainSeparator, TypeHash, Selector};
    use prop_house::common::utils::keccak::keccak_uint256s_be_to_be;
    use prop_house::common::utils::u256::{U256Zeroable, as_u256};
    use prop_house::common::utils::constants::ETHEREUM_PREFIX;
    use prop_house::common::utils::array::into_u256_arr;
    use integer::{upcast, Felt252TryIntoU32};
    use super::IEthereumSigAuthStrategy;
    use array::{ArrayTrait, SpanTrait};
    use traits::{Into, TryInto};
    use option::OptionTrait;
    use zeroable::Zeroable;

    struct Storage {
        _salts: LegacyMap<(felt252, u256), bool>, 
    }

    impl EthereumSigAuthStrategy of IEthereumSigAuthStrategy {
        fn authenticate(
            r: u256,
            s: u256,
            v: u8,
            salt: u256,
            target: ContractAddress,
            selector: felt252,
            mut cdata: Array<felt252>,
        ) {
            if selector == Selector::PROPOSE {
                _verify_propose_sig(r, s, v, salt, target, selector, cdata.span());
            } else if selector == Selector::VOTE {
                _verify_vote_sig(r, s, v, salt, target, selector, cdata.span());
            } else if selector == Selector::CANCEL_PROPOSAL {
                _verify_cancel_proposal_sig(r, s, v, salt, target, selector, cdata.span());
            } else {
                return ();
            }

            // Execute the function call with the supplied calldata
            starknet::call_contract_syscall(
                address: target, entry_point_selector: selector, calldata: cdata.span(), 
            ).unwrap_syscall();
        }
    }

    /// Verifies a `propose` signature.
    /// * `r` - The `r` component of the signature.
    /// * `s` - The `s` component of the signature.
    /// * `v` - The `v` component of the signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `target` - The address of the contract to call.
    /// * `selector` - The selector of the function to call.
    /// * `cdata` - The calldata to pass to the function.
    fn _verify_propose_sig(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        target: ContractAddress,
        selector: felt252,
        cdata: Span<felt252>,
    ) {
        // Proposer address should be located in calldata[0]
        let proposer_address = *cdata[0];

        // Ensure proposer has not already used this salt in a previous action
        assert(!_salts::read((proposer_address, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();
        let metadata_uri = cdata.slice(2, upcast(*cdata[1]));
        let metadata_uri_hash = keccak_uint256s_be_to_be(into_u256_arr(metadata_uri).span());

        // The message data
        let mut data = ArrayTrait::new();
        data.append(TypeHash::PROPOSE());
        data.append(upcast(auth_strategy_address));
        data.append(upcast(target));
        data.append(upcast(proposer_address));
        data.append(metadata_uri_hash);
        data.append(salt);

        let hash = _hash_structured_data(data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, proposer_address);

        // Write the salt to prevent replay attack
        _salts::write((proposer_address, salt), true);
    }

    /// Verifies a `vote` signature.
    /// * `r` - The `r` component of the signature.
    /// * `s` - The `s` component of the signature.
    /// * `v` - The `v` component of the signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `target` - The address of the contract to call.
    /// * `selector` - The selector of the function to call.
    /// * `cdata` - The calldata to pass to the function.
    fn _verify_vote_sig(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        target: ContractAddress,
        selector: felt252,
        cdata: Span<felt252>,
    ) {
        // Voter address should be located in calldata[0]
        let voter_address = *cdata[0];

        // Ensure voter has not already used this salt in a previous action
        assert(!_salts::read((voter_address, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();

        let proposal_votes_len = (*cdata[1]).try_into().unwrap();
        let proposal_votes = cdata.slice(2, proposal_votes_len);
        let proposal_votes_hash = keccak_uint256s_be_to_be(into_u256_arr(proposal_votes).span());

        let used_voting_strategy_ids_len = (*cdata[2 + proposal_votes_len]).try_into().unwrap();
        let used_voting_strategy_ids = cdata.slice(
            3 + proposal_votes_len, used_voting_strategy_ids_len
        );
        let used_voting_strategy_ids_hash = keccak_uint256s_be_to_be(
            into_u256_arr(used_voting_strategy_ids).span()
        );

        let user_voting_strategy_params_flat_len = (*cdata[3
            + proposal_votes_len
            + used_voting_strategy_ids_len]).try_into().unwrap();
        let user_voting_strategy_params_flat = cdata.slice(
            4 + proposal_votes_len + used_voting_strategy_ids_len,
            user_voting_strategy_params_flat_len
        );
        let user_voting_strategy_params_flat_hash = keccak_uint256s_be_to_be(
            into_u256_arr(user_voting_strategy_params_flat).span(), 
        );

        // The message data
        let mut data = ArrayTrait::new();
        data.append(TypeHash::VOTE());
        data.append(upcast(auth_strategy_address));
        data.append(upcast(target));
        data.append(upcast(voter_address));
        data.append(proposal_votes_hash);
        data.append(used_voting_strategy_ids_hash);
        data.append(user_voting_strategy_params_flat_hash);
        data.append(salt);

        let hash = _hash_structured_data(data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, voter_address);

        // Write the salt to prevent replay attack
        _salts::write((voter_address, salt), true);
    }

    /// Verifies a `cancel_proposal` signature.
    /// * `r` - The `r` component of the signature.
    /// * `s` - The `s` component of the signature.
    /// * `v` - The `v` component of the signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `target` - The address of the contract to call.
    /// * `selector` - The selector of the function to call.
    /// * `cdata` - The calldata to pass to the function.
    fn _verify_cancel_proposal_sig(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        target: ContractAddress,
        selector: felt252,
        cdata: Span<felt252>,
    ) {
        // Proposer address should be located in calldata[0], proposal_id in calldata[1]
        let proposer_address = *cdata[0];
        let proposal_id = *cdata[1];

        // Ensure proposer has not already used this salt in a previous action
        assert(!_salts::read((proposer_address, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();

        // The message data
        let mut data = ArrayTrait::new();
        data.append(TypeHash::CANCEL_PROPOSAL());
        data.append(upcast(auth_strategy_address));
        data.append(upcast(target));
        data.append(upcast(proposer_address));
        data.append(upcast(proposal_id));
        data.append(salt);

        let hash = _hash_structured_data(data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, proposer_address);

        // Write the salt to prevent replay attack
        _salts::write((proposer_address, salt), true);
    }

    /// Hash the structured EIP-712 data, including the ethereum prefix,
    // domain separator, and the message itself.
    /// * `message` - The message to hash.
    fn _hash_structured_data(message: Span<u256>) -> u256 {
        let hash_struct = keccak_uint256s_be_to_be(message);

        let mut data = ArrayTrait::new();
        data.append(upcast(ETHEREUM_PREFIX));
        data.append(DomainSeparator::GOERLI());
        data.append(hash_struct);

        keccak_uint256s_be_to_be(data.span())
    }
}
