use starknet::{ContractAddress, EthAddress};
use prop_house::common::utils::signature::KeccakTypeHash;
use prop_house::common::libraries::round::{Asset, UserStrategy};
use prop_house::rounds::infinite::config::{ProposalVote, VoteDirectionIntoU256};
use prop_house::common::utils::hash::keccak_u256s_be;
use prop_house::rounds::infinite::constants::TypeHash;
use array::{ArrayTrait, SpanTrait};
use integer::u256_from_felt252;
use traits::Into;

#[starknet::interface]
trait IInfiniteRoundEthereumSigAuthStrategy<TContractState> {
    fn authenticate_propose(
        ref self: TContractState,
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
        ref self: TContractState,
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
        ref self: TContractState,
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
    );
    fn authenticate_vote(
        ref self: TContractState,
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
        let mut encoded_data = array![
            TypeHash::PROPOSAL_VOTE,
            u256_from_felt252(self.proposal_id.into()),
            u256_from_felt252(self.proposal_version.into()),
            self.voting_power,
            self.direction.into(),
        ];
        keccak_u256s_be(encoded_data.span())
    }
}

#[starknet::contract]
mod InfiniteRoundEthereumSigAuthStrategy {
    use starknet::{ContractAddress, EthAddress, get_contract_address};
    use prop_house::rounds::infinite::config::{
        IInfiniteRoundDispatcherTrait, IInfiniteRoundDispatcher, ProposalVote
    };
    use prop_house::common::utils::signature::{KeccakTypeHash, hash_structured_data};
    use prop_house::common::utils::hash::{keccak_u256s_be, LegacyHashEthAddress};
    use prop_house::common::libraries::round::{Asset, UserStrategy};
    use prop_house::common::utils::integer::ContractAddressIntoU256;
    use prop_house::common::utils::array::Felt252SpanIntoU256Span;
    use prop_house::rounds::infinite::constants::TypeHash;
    use super::{IInfiniteRoundEthereumSigAuthStrategy, KeccakTypeHashProposalVote};
    use array::{ArrayTrait, SpanTrait};
    use integer::u256_from_felt252;
    use traits::{Into, TryInto};
    use option::OptionTrait;
    use zeroable::Zeroable;

    #[storage]
    struct Storage {
        _domain_separator: u256,
        _salts: LegacyMap<(EthAddress, u256), bool>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, domain_separator: u256) {
        initializer(ref self, domain_separator);
    }

    #[external(v0)]
    impl InfiniteRoundEthereumSigAuthStrategy of IInfiniteRoundEthereumSigAuthStrategy<ContractState> {
        /// Verify a propose signature and call the `propose` function on the round.
        /// * `r`, `s`, `v` - The signature.
        /// * `salt` - The salt used to generate the signature.
        /// * `round` - The address of the round contract.
        /// * `proposer` - The address of the proposer.
        /// * `metadata_uri` - The metadata URI of the proposal.
        /// * `requested_assets` - The assets requested by the proposer.
        /// * `used_proposing_strategies` - The strategies used by the proposer.
        fn authenticate_propose(
            ref self: ContractState,
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
            _verify_propose_sig(
                ref self,
                r,
                s,
                v,
                salt,
                round,
                proposer,
                metadata_uri.span(),
                requested_assets.span(),
                used_proposing_strategies.span()
            );
            IInfiniteRoundDispatcher {
                contract_address: round
            }.propose(proposer, metadata_uri, requested_assets, used_proposing_strategies);
        }

        /// Verify an edit_proposal signature and call the `edit_proposal` function on the round.
        /// * `r`, `s`, `v` - The signature.
        /// * `salt` - The salt used to generate the signature.
        /// * `round` - The address of the round contract.
        /// * `proposer` - The address of the proposer.
        /// * `proposal_id` - The id of the proposal to edit.
        /// * `metadata_uri` - The metadata URI of the proposal.
        /// * `requested_assets` - The assets requested by the proposal.
        fn authenticate_edit_proposal(
            ref self: ContractState,
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
            _verify_edit_proposal_sig(
                ref self,
                r,
                s,
                v,
                salt,
                round,
                proposer,
                proposal_id,
                metadata_uri.span(),
                requested_assets.span()
            );
            IInfiniteRoundDispatcher {
                contract_address: round
            }.edit_proposal(proposer, proposal_id, metadata_uri, requested_assets);
        }

        /// Verify a cancel_proposal signature and call the `cancel_proposal` function on the round.
        /// * `r`, `s`, `v` - The signature.
        /// * `salt` - The salt used to generate the signature.
        /// * `round` - The address of the round contract.
        /// * `proposer` - The address of the proposer.
        /// * `proposal_id` - The id of the proposal to cancel.
        fn authenticate_cancel_proposal(
            ref self: ContractState,
            r: u256,
            s: u256,
            v: u8,
            salt: u256,
            round: ContractAddress,
            proposer: EthAddress,
            proposal_id: u32,
        ) {
            _verify_cancel_proposal_sig(ref self, r, s, v, salt, round, proposer, proposal_id);
            IInfiniteRoundDispatcher {
                contract_address: round
            }.cancel_proposal(proposer, proposal_id);
        }

        /// Verify a vote signature and call the `vote` function on the round.
        /// * `r`, `s`, `v` - The signature.
        /// * `salt` - The salt used to generate the signature.
        /// * `round` - The address of the round contract.
        /// * `voter` - The address of the voter.
        /// * `proposal_votes` - The votes of the voter.
        /// * `used_voting_strategies` - The strategies used by the voter.
        fn authenticate_vote(
            ref self: ContractState,
            r: u256,
            s: u256,
            v: u8,
            salt: u256,
            round: ContractAddress,
            voter: EthAddress,
            proposal_votes: Array<ProposalVote>,
            used_voting_strategies: Array<UserStrategy>,
        ) {
            _verify_vote_sig(
                ref self, r, s, v, salt, round, voter, proposal_votes.span(), used_voting_strategies.span()
            );
            IInfiniteRoundDispatcher {
                contract_address: round
            }.vote(voter, proposal_votes, used_voting_strategies);
        }
    }

    /// Initializes the contract by setting the domain separator.
    fn initializer(ref self: ContractState, domain_separator_: u256) {
        self._domain_separator.write(domain_separator_);
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
        ref self: ContractState,
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
        assert(!self._salts.read((proposer, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();
        let metadata_uri_hash = keccak_u256s_be(metadata_uri.into());

        // The message data
        let mut data = array![
            TypeHash::PROPOSE,
            auth_strategy_address.into(),
            round.into(),
            u256_from_felt252(proposer.into()),
            metadata_uri_hash,
            requested_assets.hash(),
            used_proposing_strategies.hash(),
            salt,
        ];
        let hash = hash_structured_data(self._domain_separator.read(), data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, proposer);

        // Write the salt to prevent replay attack
        self._salts.write((proposer, salt), true);
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
        ref self: ContractState,
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
        assert(!self._salts.read((proposer, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();

        // The message data
        let mut data = array![
            TypeHash::EDIT_PROPOSAL,
            auth_strategy_address.into(),
            round.into(),
            u256_from_felt252(proposer.into()),
            u256_from_felt252(proposal_id.into()),
            metadata_uri.hash(),
            requested_assets.hash(),
            salt,
        ];
        let hash = hash_structured_data(self._domain_separator.read(), data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, proposer);

        // Write the salt to prevent replay attack
        self._salts.write((proposer, salt), true);
    }


    /// Verifies a `cancel_proposal` signature.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `round` - The address of the round to call.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal.
    fn _verify_cancel_proposal_sig(
        ref self: ContractState,
        r: u256,
        s: u256,
        v: u8,
        salt: u256,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
    ) {
        // Ensure proposer has not already used this salt in a previous action
        assert(!self._salts.read((proposer, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();

        // The message data
        let mut data = array![
            TypeHash::CANCEL_PROPOSAL,
            auth_strategy_address.into(),
            round.into(),
            u256_from_felt252(proposer.into()),
            u256_from_felt252(proposal_id.into()),
            salt,
        ];
        let hash = hash_structured_data(self._domain_separator.read(), data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, proposer);

        // Write the salt to prevent replay attack
        self._salts.write((proposer, salt), true);
    }

    /// Verifies a `vote` signature.
    /// * `r`, `s`, `v` - The signature.
    /// * `salt` - The salt used to prevent replay attacks.
    /// * `round` - The address of the round to call.
    /// * `voter` - The address of the voter.
    /// * `proposal_votes` - The votes of the voter.
    /// * `used_voting_strategies` - The strategies used by the voter.
    fn _verify_vote_sig(
        ref self: ContractState,
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
        assert(!self._salts.read((voter, salt)), 'EthereumSig: Salt already used');

        let auth_strategy_address = get_contract_address();

        // The message data
        let mut data = array![
            TypeHash::VOTE,
            auth_strategy_address.into(),
            round.into(),
            u256_from_felt252(voter.into()),
            proposal_votes.hash(),
            used_voting_strategies.hash(),
            salt,
        ];
        let hash = hash_structured_data(self._domain_separator.read(), data.span());

        // TODO: eth signature verification not yet supported
        // _verify_eth_signature(hash, r, s, v - 27, voter);

        // Write the salt to prevent replay attack
        self._salts.write((voter, salt), true);
    }
}
