use starknet::{ContractAddress, EthAddress};
use prop_house::common::utils::signature::KeccakTypeHash;
use prop_house::common::libraries::round::{Asset, UserStrategy};
use prop_house::rounds::infinite::config::{ProposalVote, VoteDirectionIntoU256};
use prop_house::common::utils::hash::keccak_u256s_be;
use prop_house::rounds::infinite::constants::TypeHash;
use array::{ArrayTrait, SpanTrait};
use integer::u256_from_felt252;
use traits::Into;

#[abi]
trait IInfiniteRoundEthereumSigAuthStrategy {
    fn authenticate_propose(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
        used_proposing_strategies: Array<UserStrategy>,
    );
    fn authenticate_edit_proposal(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
    );
    fn authenticate_cancel_proposal(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
    );
    fn authenticate_vote(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        voter: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    );
}

impl KeccakTypeHashProposalVote of KeccakTypeHash<ProposalVote> {
    fn hash(self: ProposalVote) -> u256 {
        let mut encoded_data = Default::default();
        encoded_data.append(TypeHash::PROPOSAL_VOTE);
        encoded_data.append(u256_from_felt252(self.proposal_id.into()));
        encoded_data.append(u256_from_felt252(self.proposal_version.into()));
        encoded_data.append(self.voting_power);
        encoded_data.append(self.direction.into());
        keccak_u256s_be(encoded_data.span())
    }
}

#[contract]
mod InfiniteRoundEthereumSigAuthStrategy {
    use starknet::{ContractAddress, EthAddress, get_contract_address,};
    use prop_house::rounds::infinite::config::{
        IInfiniteRoundDispatcherTrait, IInfiniteRoundDispatcher, ProposalVote
    };
    use prop_house::common::utils::signature::{KeccakTypeHash, hash_structured_data};
    use prop_house::common::utils::hash::{keccak_u256s_be, LegacyHashEthAddress};
    use prop_house::common::libraries::round::{Asset, UserStrategy};
    use prop_house::common::utils::integer::ContractAddressIntoU256;
    use prop_house::common::utils::array::Felt252SpanIntoU256Span;
    use prop_house::rounds::infinite::constants::TypeHash;
    use prop_house::common::utils::serde::SpanSerde;
    use super::{
        IInfiniteRoundEthereumSigAuthStrategy, KeccakTypeHashProposalVote,
    };
    use array::{ArrayTrait, SpanTrait};
    use integer::u256_from_felt252;
    use traits::{Into, TryInto};
    use option::OptionTrait;
    use zeroable::Zeroable;

    struct Storage {
        _domain_separator: u256,
        _salts: LegacyMap<(EthAddress, u256), bool>, 
    }

    impl InfiniteRoundEthereumSigAuthStrategy of IInfiniteRoundEthereumSigAuthStrategy {
        fn authenticate_propose(
            r: u256,
            s: u256,
            v: u8,
            salt: u256,
            round: ContractAddress,
            proposer: EthAddress,
            metadata_uri: Array<felt252>,
            requested_assets: Array<Asset>,
            used_proposing_strategies: Array<UserStrategy>,
        ) {
            _verify_propose_sig(r, s, v, salt, round, proposer, metadata_uri.span(), requested_assets.span(), used_proposing_strategies.span());
            IInfiniteRoundDispatcher { contract_address: round }.propose(
                proposer,
                metadata_uri,
                requested_assets,
                used_proposing_strategies,
            );
        }

        fn authenticate_edit_proposal(
            r: u256,
            s: u256,
            v: u8,
            salt: u256,
            round: ContractAddress,
            proposer: EthAddress,
            proposal_id: u32,
            metadata_uri: Array<felt252>,
            requested_assets: Array<Asset>,
        ) {
            _verify_edit_proposal_sig(r, s, v, salt, round, proposer, proposal_id, metadata_uri.span(), requested_assets.span());
            IInfiniteRoundDispatcher { contract_address: round }.edit_proposal(
                proposer,
                proposal_id,
                metadata_uri,
                requested_assets,
            );
        }

        fn authenticate_cancel_proposal(
            r: u256,
            s: u256,
            v: u8,
            salt: u256,
            round: ContractAddress,
            proposer: EthAddress,
            proposal_id: u32,
        ) {
            _verify_cancel_proposal_sig(r, s, v, salt, round, proposer, proposal_id);
            IInfiniteRoundDispatcher { contract_address: round }.cancel_proposal(
                proposer,
                proposal_id,
            );
        }

        fn authenticate_vote(
            r: u256,
            s: u256,
            v: u8,
            salt: u256,
            round: ContractAddress,
            voter: EthAddress,
            proposal_votes: Array<ProposalVote>,
            used_voting_strategies: Array<UserStrategy>,
        ) {
            _verify_vote_sig(r, s, v, salt, round, voter, proposal_votes.span(), used_voting_strategies.span());
            IInfiniteRoundDispatcher { contract_address: round }.vote(
                voter,
                proposal_votes,
                used_voting_strategies,
            );
        }
    }

    #[constructor]
    fn constructor(domain_separator: u256) {
        initializer(domain_separator);
    }

    /// Verify a propose signature and call the `propose` function on the round.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to generate the signature.
    /// * `round` - The address of the round contract.
    /// * `proposer` - The address of the proposer.
    /// * `metadata_uri` - The metadata URI of the proposal.
    /// * `requested_assets` - The assets requested by the proposer.
    /// * `used_proposing_strategies` - The strategies used by the proposer.
    #[external]
    fn authenticate_propose(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
        used_proposing_strategies: Array<UserStrategy>,
    ) {
        InfiniteRoundEthereumSigAuthStrategy::authenticate_propose(
            r,
            s,
            v,
            salt,
            round,
            proposer,
            metadata_uri,
            requested_assets,
            used_proposing_strategies,
        );
    }

    /// Verify an edit_proposal signature and call the `edit_proposal` function on the round.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to generate the signature.
    /// * `round` - The address of the round contract.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The id of the proposal to edit.
    /// * `metadata_uri` - The metadata URI of the proposal.
    /// * `requested_assets` - The assets requested by the proposal.
    #[external]
    fn authenticate_edit_proposal(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
    ) {
        InfiniteRoundEthereumSigAuthStrategy::authenticate_edit_proposal(
            r,
            s,
            v,
            salt,
            round,
            proposer,
            proposal_id,
            metadata_uri,
            requested_assets,
        );
    }

    /// Verify a cancel_proposal signature and call the `cancel_proposal` function on the round.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to generate the signature.
    /// * `round` - The address of the round contract.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The id of the proposal to cancel.
    #[external]
    fn authenticate_cancel_proposal(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
    ) {
        InfiniteRoundEthereumSigAuthStrategy::authenticate_cancel_proposal(
            r,
            s,
            v,
            salt,
            round,
            proposer,
            proposal_id,
        );
    }

    /// Verify a vote signature and call the `vote` function on the round.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to generate the signature.
    /// * `round` - The address of the round contract.
    /// * `voter` - The address of the voter.
    /// * `proposal_votes` - The votes of the voter.
    /// * `used_voting_strategies` - The strategies used by the voter.
    #[external]
    fn authenticate_vote(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        voter: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    ) {
        InfiniteRoundEthereumSigAuthStrategy::authenticate_vote(
            r,
            s,
            v,
            salt,
            round,
            voter,
            proposal_votes,
            used_voting_strategies,
        );
    }

    ///
    /// Internals
    ///

    /// Initializes the contract by setting the domain separator.
    fn initializer(domain_separator_: u256) {
        _domain_separator::write(domain_separator_);
    }


    /// Verifies a `propose` signature.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `round` - The address of the round to call.
    /// * `proposer` - The address of the proposer.
    /// * `metadata_uri` - The metadata URI of the proposal.
    /// * `requested_assets` - The assets requested by the proposer.
    /// * `used_proposing_strategies` - The strategies used by the proposer.
    fn _verify_propose_sig(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        metadata_uri: Span<felt252>,
        requested_assets: Span<Asset>,
        used_proposing_strategies: Span<UserStrategy>,
    ) {
        // Ensure proposer has not already used this salt in a previous action
        assert(!_salts::read((proposer, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();
        let metadata_uri_hash = keccak_u256s_be(metadata_uri.into());

        // The message data
        let mut data = Default::default();
        data.append(TypeHash::PROPOSE);
        data.append(auth_strategy_address.into());
        data.append(round.into());
        data.append(u256_from_felt252(proposer.into()));
        data.append(metadata_uri_hash);
        data.append(requested_assets.hash());
        data.append(used_proposing_strategies.hash());
        data.append(salt);

        let hash = hash_structured_data(_domain_separator::read(), data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, proposer);

        // Write the salt to prevent replay attack
        _salts::write((proposer, salt), true);
    }

    /// Verifies a `edit_proposal` signature.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `round` - The address of the round to call.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal.
    /// * `metadata_uri` - The metadata URI of the proposal.
    /// * `requested_assets` - The assets requested by the proposer.
    fn _verify_edit_proposal_sig(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
        metadata_uri: Span<felt252>,
        requested_assets: Span<Asset>,
    ) {
        // Ensure proposer has not already used this salt in a previous action
        assert(!_salts::read((proposer, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();

        // The message data
        let mut data = Default::default();
        data.append(TypeHash::EDIT_PROPOSAL);
        data.append(auth_strategy_address.into());
        data.append(round.into());
        data.append(u256_from_felt252(proposer.into()));
        data.append(u256_from_felt252(proposal_id.into()));
        data.append(metadata_uri.hash());
        data.append(requested_assets.hash());
        data.append(salt);

        let hash = hash_structured_data(_domain_separator::read(), data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, proposer);

        // Write the salt to prevent replay attack
        _salts::write((proposer, salt), true);
    }


    /// Verifies a `cancel_proposal` signature.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `round` - The address of the round to call.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal.
    fn _verify_cancel_proposal_sig(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
    ) {
        // Ensure proposer has not already used this salt in a previous action
        assert(!_salts::read((proposer, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();

        // The message data
        let mut data = Default::default();
        data.append(TypeHash::CANCEL_PROPOSAL);
        data.append(auth_strategy_address.into());
        data.append(round.into());
        data.append(u256_from_felt252(proposer.into()));
        data.append(u256_from_felt252(proposal_id.into()));
        data.append(salt);

        let hash = hash_structured_data(_domain_separator::read(), data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, proposer);

        // Write the salt to prevent replay attack
        _salts::write((proposer, salt), true);
    }

    /// Verifies a `vote` signature.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `round` - The address of the round to call.
    /// * `voter` - The address of the voter.
    /// * `proposal_votes` - The votes of the voter.
    /// * `used_voting_strategies` - The strategies used by the voter.
    fn _verify_vote_sig(
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        voter: EthAddress,
        proposal_votes: Span<ProposalVote>,
        used_voting_strategies: Span<UserStrategy>,
    ) {
        // Ensure voter has not already used this salt in a previous action
        assert(!_salts::read((voter, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();

        // The message data
        let mut data = Default::default();
        data.append(TypeHash::VOTE);
        data.append(auth_strategy_address.into());
        data.append(round.into());
        data.append(u256_from_felt252(voter.into()));
        data.append(proposal_votes.hash());
        data.append(used_voting_strategies.hash());
        data.append(salt);

        let hash = hash_structured_data(_domain_separator::read(), data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, voter);

        // Write the salt to prevent replay attack
        _salts::write((voter, salt), true);
    }
}
