use starknet::{ContractAddress, EthAddress};
use prop_house::common::libraries::round::UserStrategy;
use prop_house::rounds::timed::config::ProposalVote;

#[abi]
trait ITimedRoundEthereumTxAuthStrategy {
    fn authenticate_propose(
        round: ContractAddress,
        proposer: EthAddress,
        metadata_uri: Array<felt252>,
        used_proposing_strategies: Array<UserStrategy>,
    );
    fn authenticate_edit_proposal(
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
        metadata_uri: Array<felt252>,
    );
    fn authenticate_cancel_proposal(
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
    );
    fn authenticate_vote(
        round: ContractAddress,
        voter: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    );
}

#[contract]
mod TimedRoundEthereumTxAuthStrategy {
    use starknet::{ContractAddress, ContractAddressIntoFelt252, EthAddress};
    use prop_house::rounds::timed::config::{
        ITimedRoundDispatcherTrait, ITimedRoundDispatcher, ProposalVote
    };
    use prop_house::common::libraries::commit_receiver::CommitReceiver;
    use prop_house::common::libraries::round::UserStrategy;
    use prop_house::common::utils::array::ArrayTraitExt;
    use prop_house::rounds::timed::constants::Selector;
    use prop_house::common::utils::serde::SpanSerde;
    use super::ITimedRoundEthereumTxAuthStrategy;
    use array::{ArrayTrait, SpanTrait};
    use poseidon::poseidon_hash_span;
    use zeroable::Zeroable;
    use traits::Into;
    use serde::Serde;

    impl TimedRoundEthereumTxAuthStrategy of ITimedRoundEthereumTxAuthStrategy {
        fn authenticate_propose(
            round: ContractAddress,
            proposer: EthAddress,
            metadata_uri: Array<felt252>,
            used_proposing_strategies: Array<UserStrategy>,
        ) {
            let mut input = Default::default();
            input.append(round.into());
            input.append(Selector::PROPOSE);
            input.append(proposer.into());
            metadata_uri.serialize(ref input);
            used_proposing_strategies.serialize(ref input);

            // Check that the hash matches a commit and that the commit was created by the correct address
            CommitReceiver::consume_commit(proposer.into(), poseidon_hash_span(input.span()));

            ITimedRoundDispatcher { contract_address: round }.propose(
                proposer,
                metadata_uri,
                used_proposing_strategies,
            );
        }

        fn authenticate_edit_proposal(
            round: ContractAddress,
            proposer: EthAddress,
            proposal_id: u32,
            metadata_uri: Array<felt252>,
        ) {
            let mut input = Default::default();
            input.append(round.into());
            input.append(Selector::EDIT_PROPOSAL);
            input.append(proposer.into());
            input.append(proposal_id.into());
            metadata_uri.serialize(ref input);

            // Check that the hash matches a commit and that the commit was created by the correct address
            CommitReceiver::consume_commit(proposer.into(), poseidon_hash_span(input.span()));

            ITimedRoundDispatcher { contract_address: round }.edit_proposal(
                proposer,
                proposal_id,
                metadata_uri,
            );
        }

        fn authenticate_cancel_proposal(
            round: ContractAddress,
            proposer: EthAddress,
            proposal_id: u32,
        ) {
            let mut input = Default::default();
            input.append(round.into());
            input.append(Selector::CANCEL_PROPOSAL);
            input.append(proposer.into());
            input.append(proposal_id.into());

            // Check that the hash matches a commit and that the commit was created by the correct address
            CommitReceiver::consume_commit(proposer.into(), poseidon_hash_span(input.span()));

            ITimedRoundDispatcher { contract_address: round }.cancel_proposal(proposer, proposal_id);
        }

        fn authenticate_vote(
            round: ContractAddress,
            voter: EthAddress,
            proposal_votes: Array<ProposalVote>,
            used_voting_strategies: Array<UserStrategy>,
        ) {
            let mut input = Default::default();
            input.append(round.into());
            input.append(Selector::VOTE);
            input.append(voter.into());
            proposal_votes.serialize(ref input);
            used_voting_strategies.serialize(ref input);

            // Check that the hash matches a commit and that the commit was created by the correct address
            CommitReceiver::consume_commit(voter.into(), poseidon_hash_span(input.span()));

            ITimedRoundDispatcher { contract_address: round }.vote(
                voter,
                proposal_votes,
                used_voting_strategies,
            );
        }
    }

    #[constructor]
    fn constructor(commit_address: ContractAddress) {
        CommitReceiver::initializer(commit_address);
    }

    /// Verify an Ethereum propose commit and call the `propose` function on the round.
    /// * `round` - The address of the round contract.
    /// * `proposer` - The address of the proposer.
    /// * `metadata_uri` - The metadata URI of the proposal.
    /// * `used_proposing_strategies` - The strategies used by the proposer.
    #[external]
    fn authenticate_propose(
        round: ContractAddress,
        proposer: EthAddress,
        metadata_uri: Array<felt252>,
        used_proposing_strategies: Array<UserStrategy>,
    ) {
        TimedRoundEthereumTxAuthStrategy::authenticate_propose(
            round,
            proposer,
            metadata_uri,
            used_proposing_strategies,
        );
    }

    /// Verify an Ethereum edit proposal commit and call the `edit_proposal` function on the round.
    /// * `round` - The address of the round contract.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal.
    /// * `metadata_uri` - The metadata URI of the proposal.
    #[external]
    fn authenticate_edit_proposal(
        round: ContractAddress,
        proposer: EthAddress,
        proposal_id: u32,
        metadata_uri: Array<felt252>,
    ) {
        TimedRoundEthereumTxAuthStrategy::authenticate_edit_proposal(
            round,
            proposer,
            proposal_id,
            metadata_uri,
        );
    }

    /// Verify an Ethereum cancel proposal commit and call the `cancel_proposal` function on the round.
    /// * `round` - The address of the round contract.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal.
    #[external]
    fn authenticate_cancel_proposal(round: ContractAddress, proposer: EthAddress, proposal_id: u32) {
        TimedRoundEthereumTxAuthStrategy::authenticate_cancel_proposal(
            round,
            proposer,
            proposal_id,
        );
    }

    /// Verify an Ethereum vote commit and call the `vote` function on the round.
    /// * `round` - The address of the round contract.
    /// * `voter` - The address of the voter.
    /// * `proposal_votes` - The votes of the voter.
    /// * `used_voting_strategies` - The strategies used by the voter.
    #[external]
    fn authenticate_vote(
        round: ContractAddress,
        voter: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    ) {
        TimedRoundEthereumTxAuthStrategy::authenticate_vote(
            round,
            voter,
            proposal_votes,
            used_voting_strategies,
        );
    }

    /// Commits a hash from Ethereum to be consumed at a later time.
    /// * `from_address` - The address from which the L1 message was sent.
    /// * `sender` - The sender of the commit on L1.
    /// * `commit_hash` - The commit hash.
    #[l1_handler]
    fn commit(from_address: felt252, sender: felt252, commit_hash: felt252) {
        CommitReceiver::commit(from_address, sender, commit_hash);
    }
}
