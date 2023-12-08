use starknet::{ContractAddress, EthAddress};
use prop_house::common::libraries::round::{Asset, UserStrategy};
use prop_house::rounds::infinite::config::ProposalVote;

#[starknet::interface]
trait IInfiniteRoundEthereumTxAuthStrategy<TContractState> {
    fn authenticate_propose(
        ref self: TContractState,
        round: ContractAddress,
        proposer: EthAddress,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
        used_proposing_strategies: Array<UserStrategy>,
    );
    fn authenticate_edit_proposal(
        ref self: TContractState,
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
    );
    fn authenticate_cancel_proposal(
        ref self: TContractState, round: ContractAddress, proposer: EthAddress, proposal_id: u32, 
    );
    fn authenticate_vote(
        ref self: TContractState,
        round: ContractAddress,
        voter: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    );
}

#[starknet::contract]
mod InfiniteRoundEthereumTxAuthStrategy {
    use starknet::{ContractAddress, ContractAddressIntoFelt252, EthAddress};
    use prop_house::rounds::infinite::config::{
        IInfiniteRoundDispatcherTrait, IInfiniteRoundDispatcher, ProposalVote
    };
    use prop_house::common::libraries::commit_receiver::CommitReceiver;
    use prop_house::common::libraries::round::{Asset, UserStrategy};
    use prop_house::common::utils::array::ArrayTraitExt;
    use prop_house::rounds::infinite::constants::Selector;
    use super::IInfiniteRoundEthereumTxAuthStrategy;
    use array::{ArrayTrait, SpanTrait};
    use poseidon::poseidon_hash_span;
    use zeroable::Zeroable;
    use traits::Into;
    use serde::Serde;

    #[storage]
    struct Storage {}

    #[constructor]
    fn constructor(ref self: ContractState, commit_address: EthAddress) {
        let mut cr_state = CommitReceiver::unsafe_new_contract_state();
        CommitReceiver::initializer(ref cr_state, commit_address);
    }

    #[external(v0)]
    impl InfiniteRoundEthereumTxAuthStrategy of IInfiniteRoundEthereumTxAuthStrategy<ContractState> {
        /// Verify an Ethereum propose commit and call the `propose` function on the round.
        /// * `round` - The address of the round contract.
        /// * `proposer` - The address of the proposer.
        /// * `metadata_uri` - The metadata URI of the proposal.
        /// * `requested_assets` - The assets requested by the proposer.
        /// * `used_proposing_strategies` - The strategies used by the proposer.
        fn authenticate_propose(
            ref self: ContractState,
            round: ContractAddress,
            proposer: EthAddress,
            metadata_uri: Array<felt252>,
            requested_assets: Array<Asset>,
            used_proposing_strategies: Array<UserStrategy>,
        ) {
            let mut input = array![
                round.into(),
                Selector::PROPOSE,
                proposer.into(),
            ];
            metadata_uri.serialize(ref input);
            requested_assets.serialize(ref input);
            used_proposing_strategies.serialize(ref input);

            // Check that the hash matches a commit and that the commit was created by the correct address
            let mut cr_state = CommitReceiver::unsafe_new_contract_state();
            CommitReceiver::consume_commit(ref cr_state, proposer.into(), poseidon_hash_span(input.span()));

            IInfiniteRoundDispatcher {
                contract_address: round
            }.propose(proposer, metadata_uri, requested_assets, used_proposing_strategies);
        }

        /// Verify an Ethereum edit proposal commit and call the `edit_proposal` function on the round.
        /// * `round` - The address of the round contract.
        /// * `proposer` - The address of the proposer.
        /// * `proposal_id` - The ID of the proposal.
        /// * `requested_assets` - The assets requested by the proposer.
        /// * `metadata_uri` - The metadata URI of the proposal.
        fn authenticate_edit_proposal(
            ref self: ContractState,
            round: ContractAddress,
            proposer: EthAddress,
            proposal_id: u32,
            metadata_uri: Array<felt252>,
            requested_assets: Array<Asset>,
        ) {
            let mut input = array![
                round.into(),
                Selector::EDIT_PROPOSAL,
                proposer.into(),
                proposal_id.into(),
            ];
            metadata_uri.serialize(ref input);
            requested_assets.serialize(ref input);

            // Check that the hash matches a commit and that the commit was created by the correct address
            let mut cr_state = CommitReceiver::unsafe_new_contract_state();
            CommitReceiver::consume_commit(ref cr_state, proposer.into(), poseidon_hash_span(input.span()));

            IInfiniteRoundDispatcher {
                contract_address: round
            }.edit_proposal(proposer, proposal_id, metadata_uri, requested_assets);
        }

        /// Verify an Ethereum cancel proposal commit and call the `cancel_proposal` function on the round.
        /// * `round` - The address of the round contract.
        /// * `proposer` - The address of the proposer.
        /// * `proposal_id` - The ID of the proposal.
        fn authenticate_cancel_proposal(
            ref self: ContractState, round: ContractAddress, proposer: EthAddress, proposal_id: u32, 
        ) {
            let mut input = array![
                round.into(),
                Selector::CANCEL_PROPOSAL,
                proposer.into(),
                proposal_id.into(),
            ];

            // Check that the hash matches a commit and that the commit was created by the correct address
            let mut cr_state = CommitReceiver::unsafe_new_contract_state();
            CommitReceiver::consume_commit(ref cr_state, proposer.into(), poseidon_hash_span(input.span()));

            IInfiniteRoundDispatcher {
                contract_address: round
            }.cancel_proposal(proposer, proposal_id);
        }

        /// Verify an Ethereum vote commit and call the `vote` function on the round.
        /// * `round` - The address of the round contract.
        /// * `voter` - The address of the voter.
        /// * `proposal_votes` - The votes of the voter.
        /// * `used_voting_strategies` - The strategies used by the voter.
        fn authenticate_vote(
            ref self: ContractState,
            round: ContractAddress,
            voter: EthAddress,
            proposal_votes: Array<ProposalVote>,
            used_voting_strategies: Array<UserStrategy>,
        ) {
            let mut input = array![
                round.into(),
                Selector::VOTE,
                voter.into(),
            ];
            proposal_votes.serialize(ref input);
            used_voting_strategies.serialize(ref input);

            // Check that the hash matches a commit and that the commit was created by the correct address
            let mut cr_state = CommitReceiver::unsafe_new_contract_state();
            CommitReceiver::consume_commit(ref cr_state, voter.into(), poseidon_hash_span(input.span()));

            IInfiniteRoundDispatcher {
                contract_address: round
            }.vote(voter, proposal_votes, used_voting_strategies);
        }
    }

    /// Commits a hash from Ethereum to be consumed at a later time.
    /// * `from_address` - The address from which the L1 message was sent.
    /// * `sender` - The sender of the commit on L1.
    /// * `commit_hash` - The commit hash.
    #[l1_handler]
    fn commit(ref self: ContractState, from_address: felt252, sender: felt252, commit_hash: felt252) {
        let mut cr_state = CommitReceiver::unsafe_new_contract_state();
        CommitReceiver::commit(ref cr_state, from_address, sender, commit_hash);
    }
}
