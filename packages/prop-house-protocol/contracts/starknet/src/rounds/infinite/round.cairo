use prop_house::common::libraries::round::{Asset, UserStrategy};
use prop_house::common::registry::strategy::Strategy;
use prop_house::rounds::infinite::config::Proposal;
use prop_house::common::utils::integer::u250;
use starknet::EthAddress;
use array::ArrayTrait;

// TODO: Need to revert if voting for a proposal in which the asset balance is no longer available.

// selected -> used? Also maybe rename `SelectedStategy` to `GovPoweStrategy` or something? Strategy -> RawStrategy?

trait IInfiniteRound {
    fn get_proposal(proposal_id: u32) -> Proposal;
    fn propose(
        proposer_address: EthAddress,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
        used_proposing_strategies: Array<UserStrategy>,
    );
    fn edit_proposal(proposer_address: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>, requested_assets: Array<Asset>);
    fn cancel_proposal(proposer_address: EthAddress, proposal_id: u32);
    fn vote(
        voter_address: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    );
    fn report_results();
    // fn finalize_round(awards: Array<Asset>);
}

struct RoundParams {
    start_timestamp: u64,
    vote_period: u64,
    quorum_for: u250,
    quorum_against: u250,
    proposal_threshold: u250,
    proposing_strategies: Span<Strategy>,
    voting_strategies: Span<Strategy>,
}

#[derive(Copy, Drop, Serde)]
enum VoteDirection {
    For: (),
    Against: (),
}

#[derive(Copy, Drop, Serde)]
struct ProposalVote {
    proposal_id: u32,
    asset_metadata_hash: felt252,
    voting_power: u256,
    direction: VoteDirection
}

#[contract]
mod InfiniteRound {
    use starknet::{
        ContractAddress, EthAddress, get_block_timestamp, get_caller_address,
        Felt252TryIntoContractAddress
    };
    use super::{IInfiniteRound, ProposalVote, RoundParams, VoteDirection};
    use prop_house::rounds::infinite::config::{RoundState, RoundConfig, Proposal, ProposalState, ProposalWithId};
    use prop_house::rounds::infinite::constants::{MAX_WINNER_TREE_DEPTH, MAX_REQUESTED_ASSET_COUNT};
    use prop_house::common::libraries::round::{Asset, Round, UserStrategy, StrategyGroup};
    use prop_house::common::utils::contract::get_round_dependency_registry;
    use prop_house::common::utils::traits::{
        IExecutionStrategyDispatcherTrait, IExecutionStrategyDispatcher,
        IRoundDependencyRegistryDispatcherTrait,
    };
    use prop_house::common::utils::array::{assert_no_duplicates_u256, into_u256_arr};
    use prop_house::common::utils::hash::{keccak_u256s_be, LegacyHashEthAddress};
    use prop_house::common::utils::constants::{MASK_192, MASK_250, DependencyKey, StrategyType};
    use prop_house::common::utils::merkle::IncrementalMerkleTreeTrait;
    use prop_house::common::utils::integer::Felt252TryIntoU250;
    use prop_house::common::utils::serde::SpanSerde;
    use integer::{u256_from_felt252, U16IntoFelt252, U32IntoFelt252};
    use array::{ArrayTrait, SpanTrait};
    use traits::{TryInto, Into};
    use option::OptionTrait;
    use zeroable::Zeroable;

    struct Storage {
        _config: RoundConfig,
        _winner_count: u32,
        _winner_merkle_root: u256,
        _last_reported_winner_count: u32,
        _proposal_count: u32,
        _proposals: LegacyMap<u32, Proposal>,
        _spent_voting_power: LegacyMap<(EthAddress, u32), u256>,
        _asset_balances: LegacyMap<u256, u256>,
    }

    #[event]
    fn ProposalCreated(
        proposal_id: u32, proposer_address: EthAddress, metadata_uri: Array<felt252>, requested_assets: Array<Asset>,
    ) {}

    #[event]
    fn ProposalEdited(proposal_id: u32, updated_metadata_uri: Array<felt252>, updated_requested_assets: Array<Asset>) {}

    #[event]
    fn ProposalCancelled(proposal_id: u32) {}

    #[event]
    fn ProposalApproved(proposal_id: u32) {}

    #[event]
    fn ProposalRejected(proposal_id: u32) {}

    #[event]
    fn VoteCast(proposal_id: u32, voter_address: EthAddress, voting_power: u256, direction: VoteDirection) {}

    #[event]
    fn ResultsReported(winner_count: u32, merkle_root: u256) {}

    // #[event]
    // fn RoundFinalized(winning_proposal_ids: Span<u32>, merkle_root: u256) {}

    impl InfiniteRound of IInfiniteRound {
        fn get_proposal(proposal_id: u32) -> Proposal {
            let proposal = _proposals::read(proposal_id);
            assert(proposal.proposer.is_non_zero(), 'IR: Proposal does not exist');

            proposal
        }

        fn propose(
            proposer_address: EthAddress,
            metadata_uri: Array<felt252>,
            requested_assets: Array<Asset>,
            used_proposing_strategies: Array<UserStrategy>,
        ) {
            // Verify that the caller is a valid auth strategy
            Round::assert_caller_is_valid_auth_strategy();

            // Verify that the round is active
            _assert_round_active();

            // Verify that the asset request is reasonably sized
            assert(requested_assets.len() < MAX_REQUESTED_ASSET_COUNT, 'IR: Too many assets requested');

            // Verify there are no duplicate assets
            _assert_no_duplicate_assets(requested_assets.span()); // TODO: Only convert to span once

            // Verify that the round has sufficient balances of the requested assets
            _assert_sufficient_asset_balances(requested_assets.span());

            let config = _config::read();

            // Determine the cumulative proposition power of the user
            let cumulative_proposition_power = Round::get_cumulative_governance_power(
                config.start_timestamp,
                proposer_address,
                StrategyType::PROPOSING,
                used_proposing_strategies.span(),
            );
            assert(
                cumulative_proposition_power >= config.proposal_threshold.inner.into(),
                'IR: Proposition power too low'
            );

            let requested_assets_hash = Round::compute_asset_hash(requested_assets.span());
            let proposal_id = _proposal_count::read() + 1;
            let proposal = Proposal {
                version: 1,
                state: ProposalState::Active(()),
                received_at: get_block_timestamp(),
                proposer: proposer_address,
                requested_assets_hash,
                voting_power_for: 0,
                voting_power_against: 0,
            };

            // Store the proposal and increment the proposal count
            _proposals::write(proposal_id, proposal);
            _proposal_count::write(proposal_id);

            ProposalCreated(proposal_id, proposer_address, metadata_uri, requested_assets);
        }

        fn edit_proposal(
            proposer_address: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>, requested_assets: Array<Asset>,
        ) {
            // Verify that the caller is a valid auth strategy
            Round::assert_caller_is_valid_auth_strategy();

            // Verify that the round is active
            _assert_round_active();

            // Verify that the asset request is reasonably sized
            assert(requested_assets.len() < MAX_REQUESTED_ASSET_COUNT, 'IR: Too many assets requested');

            // Verify there are no duplicate assets
            _assert_no_duplicate_assets(requested_assets.span()); // TODO: Only convert to span once

            // Verify that the round has sufficient balances of the requested assets
            _assert_sufficient_asset_balances(requested_assets.span());

            let mut proposal = _proposals::read(proposal_id);
            let requested_assets_hash = Round::compute_asset_hash(requested_assets.span());

            // Ensure that the proposal exists
            assert(proposal.proposer.is_non_zero(), 'IR: Proposal does not exist');

            // Ensure that the caller is the proposer
            assert(proposer_address == proposal.proposer, 'IR: Caller is not proposer');

            // Ensure that the proposal is active
            assert(_get_proposal_state(proposal) == ProposalState::Active(()), 'IR: Proposal is not active');        

            // Increment the proposal version, update the requested assets, and emit the metadata URI
            proposal.version += 1;
            proposal.requested_assets_hash = requested_assets_hash;
            _proposals::write(proposal_id, proposal);

            ProposalEdited(proposal_id, metadata_uri, requested_assets);
        }

        fn cancel_proposal(proposer_address: EthAddress, proposal_id: u32) {
            // Verify that the caller is a valid auth strategy
            Round::assert_caller_is_valid_auth_strategy();

            // Verify that the round is active
            _assert_round_active();

            let mut proposal = _proposals::read(proposal_id);

            // Ensure that the proposal exists
            assert(proposal.proposer.is_non_zero(), 'IR: Proposal does not exist');

            // Ensure that the caller is the proposer
            assert(proposer_address == proposal.proposer, 'IR: Caller is not proposer');

            // Ensure that the proposal is active
            assert(_get_proposal_state(proposal) == ProposalState::Active(()), 'IR: Proposal is not active');

            // Cancel the proposal
            proposal.state = ProposalState::Cancelled(());
            _proposals::write(proposal_id, proposal);

            ProposalCancelled(proposal_id);
        }

        fn vote(
            voter_address: EthAddress,
            proposal_votes: Array<ProposalVote>,
            used_voting_strategies: Array<UserStrategy>,
        ) {
            // Verify that the caller is a valid auth strategy
            Round::assert_caller_is_valid_auth_strategy();

            // Verify that the round is active
            _assert_round_active();

            let config = _config::read();

            // Determine the cumulative voting power of the user
            let cumulative_voting_power = Round::get_cumulative_governance_power(
                config.start_timestamp,
                voter_address,
                StrategyType::VOTING,
                used_voting_strategies.span(),
            );
            assert(cumulative_voting_power.is_non_zero(), 'IR: User has no voting power');

            // Cast votes, throwing if the remaining voting power is insufficient
            _cast_votes_on_one_or_more_proposals(
                voter_address, cumulative_voting_power, proposal_votes.span()
            );
        }

        /// Report new winners to a consuming contract. Revert if there are no new winners.
        fn report_results() {
            // Verify that the round is active
            _assert_round_active();

            let winner_count = _winner_count::read();
            assert(winner_count > 0 & winner_count > _last_reported_winner_count::read(), 'IR: No new winners');

            // Update the last reported winner count
            _last_reported_winner_count::write(winner_count);

            let merkle_root = _winner_merkle_root::read();
            let execution_strategy_address = get_round_dependency_registry().get_caller_dependency_at_key(
                Round::chain_id(), DependencyKey::EXECUTION_STRATEGY
            );
            if execution_strategy_address.is_non_zero() {
                let execution_strategy = IExecutionStrategyDispatcher {
                    contract_address: execution_strategy_address,
                };
                execution_strategy.execute(_build_execution_params(merkle_root));
            }

            ResultsReported(winner_count, merkle_root);
        }

        // TODO: Need function to report proposal results
        // fn finalize_round(awards: Array<Asset>) {
        //     // Verify that the round is active
        //     _assert_round_active();

        //     // Verify the validity of the provided awards
        //     _assert_awards_valid(awards.span());

        //     let config = _config::read();
        //     let current_timestamp = get_block_timestamp();

        //     assert(
        //         current_timestamp > config.vote_period_end_timestamp, 'IR: Vote period not ended'
        //     );

        //     let proposal_count = Round::_proposal_count::read();

        //     // If no proposals were submitted, the round must be cancelled.
        //     assert(proposal_count != 0, 'IR: No proposals submitted');

        //     let active_proposals = Round::get_active_proposals();
        //     let winning_proposals = Round::get_n_proposals_by_voting_power_desc(
        //         active_proposals, config.winner_count.into()
        //     );

        //     // Compute the merkle root for the given leaves.
        //     let leaves = _compute_leaves(winning_proposals, awards);

        //     let mut merkle_tree = MerkleTreeTrait::<u256>::new();
        //     let merkle_root = merkle_tree.compute_merkle_root(leaves);

        //     let round_dependency_registry = IRoundDependencyRegistryDispatcher {
        //         contract_address: RegistryAddress::ROUND_DEPENDENCY_REGISTRY,
        //     };
        //     let execution_strategy_address = round_dependency_registry.get_caller_dependency_at_key(
        //         // TODO: Populate chain ID
        //         Round::chain_id(), DependencyKey::EXECUTION_STRATEGY
        //     );
        //     if execution_strategy_address.is_non_zero() {
        //         let execution_strategy = IExecutionStrategyDispatcher {
        //             contract_address: execution_strategy_address,
        //         };
        //         execution_strategy.execute(_build_execution_params(merkle_root));
        //     }

        //     let mut config = _config::read();

        //     config.round_state = RoundState::Finalized(());
        //     _config::write(config);

        //     RoundFinalized(Round::extract_proposal_ids(winning_proposals), merkle_root);
        // }
    }

    #[constructor]
    fn constructor(round_params: Array<felt252>) {
        initializer(round_params.span());
    }

    /// Returns the proposal for the given proposal ID.
    /// * `proposal_id` - The proposal ID.
    #[view]
    fn get_proposal(proposal_id: u32) -> Proposal {
        InfiniteRound::get_proposal(proposal_id)
    }

    /// Submit a proposal to the round.
    /// * `proposer_address` - The address of the proposer.
    /// * `metadata_uri` - The proposal metadata URI.
    /// * `requested_assets` - The assets requested by the proposal.
    /// * `used_proposing_strategies` - The strategies used to propose.
    #[external]
    fn propose(
        proposer_address: EthAddress,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
        used_proposing_strategies: Array<UserStrategy>,
    ) {
        InfiniteRound::propose(
            proposer_address,
            metadata_uri,
            requested_assets,
            used_proposing_strategies,
        );
    }

    /// Edit a proposal.
    /// * `proposer_address` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal to cancel.
    /// * `metadata_uri` - The updated proposal metadata URI.
    /// * `requested_assets` - The updated assets requested by the proposal.
    #[external]
    fn edit_proposal(proposer_address: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>, requested_assets: Array<Asset>) {
        InfiniteRound::edit_proposal(proposer_address, proposal_id, metadata_uri, requested_assets);
    }

    /// Cancel a proposal.
    /// * `proposer_address` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal to cancel.
    #[external]
    fn cancel_proposal(proposer_address: EthAddress, proposal_id: u32) {
        InfiniteRound::cancel_proposal(proposer_address, proposal_id);
    }

    /// Cast votes on one or more proposals.
    /// * `voter_address` - The address of the voter.
    /// * `proposal_votes` - The votes to cast.
    /// * `used_voting_strategies` - The strategies used to vote.
    #[external]
    fn vote(
        voter_address: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    ) {
        InfiniteRound::vote(
            voter_address,
            proposal_votes,
            used_voting_strategies,
        );
    }

    /// Report all round winners since the last report.
    #[external]
    fn report_results() {
        InfiniteRound::report_results();
    }

    ///
    /// Internals
    ///

    /// Initialize the round.
    fn initializer(round_params_: Span<felt252>) {
        let RoundParams {
            start_timestamp,
            vote_period,
            quorum_for,
            quorum_against,
            proposal_threshold,
            proposing_strategies,
            voting_strategies,
        } = _decode_param_array(round_params_);


        assert(start_timestamp.is_non_zero(), 'IR: Invalid start timestamp');
        assert(vote_period.is_non_zero(), 'IR: Invalid vote period');
        assert(quorum_for.is_non_zero(), 'IR: Quorums must be non-zero');
        assert(quorum_against.is_non_zero(), 'IR: Quorums must be non-zero');
        assert(voting_strategies.len().is_non_zero(), 'IR: No voting strategies');

        _config::write(
            RoundConfig {
                round_state: RoundState::Active(()),
                start_timestamp,
                vote_period,
                quorum_for,
                quorum_against,
                proposal_threshold,
            }
        );

        let mut strategy_groups = Default::default();
        strategy_groups.append(
            StrategyGroup {
                strategy_type: StrategyType::PROPOSING,
                strategies: proposing_strategies
            },
        );
        strategy_groups.append(
            StrategyGroup {
                strategy_type: StrategyType::VOTING,
                strategies: voting_strategies
            },
        );
        Round::initializer(1, strategy_groups.span()); // TODO: How to get chain ID?
    }

    /// Decode the round parameters from an array of felt252s.
    /// * `params` - The array of felt252s.
    fn _decode_param_array(params: Span<felt252>) -> RoundParams {
        let start_timestamp = (*params.at(0)).try_into().unwrap();
        let vote_period = (*params.at(1)).try_into().unwrap();
        let quorum_for = (*params.at(2)).try_into().unwrap();
        let quorum_against = (*params.at(3)).try_into().unwrap();
        let proposal_threshold = (*params.at(4)).try_into().unwrap();

        let (proposing_strategies, offset) = Round::parse_strategies(params, 5);
        let (voting_strategies, _) = Round::parse_strategies(params, offset);

        RoundParams {
            start_timestamp,
            vote_period,
            quorum_for,
            quorum_against,
            proposal_threshold,
            proposing_strategies,
            voting_strategies,
        }
    }

    /// Asserts that the round is active.
    fn _assert_round_active() {
        assert(_config::read().round_state == RoundState::Active(()), 'IR: Round not active');
    }

    /// Reverts if the asset array contains duplicate assets.
    /// * `assets` - The array of assets.
    fn _assert_no_duplicate_assets(mut assets: Span<Asset>) {
        let mut asset_ids = Default::default();
        loop {
            match assets.pop_front() {
                Option::Some(a) => {
                    asset_ids.append(*a.asset_id);
                },
                Option::None(()) => {
                    break;
                },
            };
        };
        assert_no_duplicates_u256(asset_ids.span());
    }

    /// Reverts if the strategy does not have sufficient balances to fulfill the request.
    /// Note that this function does NOT handle duplicate asset requests. Ensure duplicate
    /// validation has occurred prior to calling this function.
    /// * `requested_assets` - The assets requested by the proposer.
    fn _assert_sufficient_asset_balances(mut requested_assets: Span<Asset>) {
        loop {
            match requested_assets.pop_front() {
                Option::Some(a) => {
                    let a = *a;
                    let asset_balance = _asset_balances::read(a.asset_id);
                    assert(asset_balance >= a.amount, 'IR: Insufficient balance');
                },
                Option::None(_) => {
                    break;
                },
            };
        };
    }

    /// Cast votes on one or more proposals.
    /// * `voter_address` - The address of the voter.
    /// * `cumulative_voting_power` - The cumulative voting power of the voter.
    /// * `proposal_votes` - The votes to cast.
    fn _cast_votes_on_one_or_more_proposals(
        voter_address: EthAddress,
        cumulative_voting_power: u256,
        mut proposal_votes: Span<ProposalVote>
    ) {
        loop {
            match proposal_votes.pop_front() {
                Option::Some(proposal_vote) => {
                    // Cast the votes for the proposal
                    _cast_votes_on_proposal(voter_address, *proposal_vote, cumulative_voting_power);
                },
                Option::None(_) => {
                    break;
                },
            };
        };
    }

    /// Cast votes on a single proposal.
    /// * `voter_address` - The address of the voter.
    /// * `proposal_vote` - The proposal vote information.
    /// * `cumulative_voting_power` - The cumulative voting power of the voter.
    fn _cast_votes_on_proposal(
        voter_address: EthAddress, proposal_vote: ProposalVote, cumulative_voting_power: u256, 
    ) {
        let proposal_id = proposal_vote.proposal_id;
        let voting_power = proposal_vote.voting_power;
        let direction = proposal_vote.direction;

        let mut proposal = _proposals::read(proposal_id);
        assert(proposal.proposer.is_non_zero(), 'IR: Proposal does not exist');

        // Exit early if the proposal is not active
        if _get_proposal_state(proposal) != ProposalState::Active(()) {
            return;
        }

        let mut spent_voting_power = _spent_voting_power::read((voter_address, proposal_id));
        let mut remaining_voting_power = cumulative_voting_power - spent_voting_power;

        assert(voting_power.is_non_zero(), 'IR: No voting power provided');
        assert(remaining_voting_power >= voting_power, 'IR: Insufficient voting power');

        match direction {
            VoteDirection::For(()) => {
                proposal.voting_power_for += voting_power;
            },
            VoteDirection::Against(()) => {
                proposal.voting_power_against += voting_power;
            },
        };

        let config = _config::read();
        if proposal.voting_power_for >= config.quorum_for.inner.into() {
            proposal.state = ProposalState::Approved(());

            // TODO: Move to its own function.
            let winner_count = _winner_count::read();
            let mut incremental_merkle_tree = IncrementalMerkleTreeTrait::<u256>::new(
                MAX_WINNER_TREE_DEPTH,
                winner_count,
                Default::default(), // TODO: Need to store this information :/
            );
            let leaf = 1; // TODO: compute leaf. put in `Round`?

            _winner_merkle_root::write(incremental_merkle_tree.append_leaf(leaf));
            _winner_count::write(winner_count + 1);

            // TODO: If winner count == max_winner_count, then end round.

            ProposalApproved(proposal_id);
        } else if proposal.voting_power_against >= config.quorum_against.inner.into() {
            proposal.state = ProposalState::Rejected(());
            ProposalRejected(proposal_id);
        }
        _proposals::write(proposal_id, proposal);
        _spent_voting_power::write((voter_address, proposal_id), spent_voting_power);

        VoteCast(proposal_id, voter_address, voting_power, direction);
    }

    /// Build the execution parameters that will be passed to the execution strategy.
    /// * `merkle_root` - The merkle root that will be used for asset claims.
    fn _build_execution_params(merkle_root: u256) -> Span<felt252> {
        let mut execution_params = Default::default();
        execution_params.append(merkle_root.low.into());
        execution_params.append(merkle_root.high.into());

        execution_params.span()
    }

    fn _append_to_winner_merkle_tree() {
        
    }

    /// Compute a single leaf consisting of a proposal ID, proposer address, asset ID, and asset amount.
    /// * `p` - The proposal to compute the leaf for.
    /// * `asset_id` - The ID of the asset to award.
    /// * `asset_amount` - The amount of the asset to award.
    fn _compute_leaf_for_proposal_award(
        p: ProposalWithId, asset_id: u256, asset_amount: u256
    ) -> u256 {
        let proposal_id: felt252 = p.proposal_id.into();

        let mut leaf_input = Default::default();
        leaf_input.append(proposal_id.into());
        leaf_input.append(u256_from_felt252(p.proposal.proposer.into()));
        // TODO: leaf_input.append(asset_request_hash);
        // leaf_input.append(asset_id);
        // leaf_input.append(asset_amount);

        keccak_u256s_be(leaf_input.span())
    }

    /// Get the state of the given proposal.
    /// * `proposal` - The proposal to get the state of.
    fn _get_proposal_state(proposal: Proposal) -> ProposalState {
        if proposal.state == ProposalState::Active(()) {
            // If the proposal is active, check if it has become stale.
            if get_block_timestamp() > proposal.received_at + _config::read().vote_period {
                return ProposalState::Stale(());
            }
        }
        proposal.state
    }
}
