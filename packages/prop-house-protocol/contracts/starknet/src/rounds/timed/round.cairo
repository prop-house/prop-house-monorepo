#[contract]
mod TimedRound {
    use starknet::{EthAddress, get_block_timestamp, get_caller_address};
    use prop_house::rounds::timed::config::{
        ITimedRound, RoundState, RoundConfig, RoundParams, Proposal, ProposalVote, LeadingProposals,
    };
    use prop_house::rounds::timed::constants::MAX_WINNERS;
    use prop_house::common::libraries::round::{Asset, Round, UserStrategy, StrategyGroup};
    use prop_house::common::utils::contract::get_round_dependency_registry;
    use prop_house::common::utils::traits::{
        IExecutionStrategyDispatcherTrait, IExecutionStrategyDispatcher,
        IRoundDependencyRegistryDispatcherTrait,
    };
    use prop_house::common::utils::hash::{keccak_u256s_be, LegacyHashEthAddress};
    use prop_house::common::utils::constants::{DependencyKey, RoundType, StrategyType};
    use prop_house::common::utils::storage::PackedU32VecStorageAccess;
    use prop_house::common::utils::merkle::MerkleTreeTrait;
    use prop_house::common::utils::vec::{Vec, VecTrait};
    use prop_house::common::utils::serde::SpanSerde;
    use nullable::{NullableTrait, FromNullableResult, match_nullable};
    use array::{ArrayTrait, SpanTrait};
    use integer::u256_from_felt252;
    use traits::{TryInto, Into};
    use dict::Felt252DictTrait;
    use option::OptionTrait;
    use zeroable::Zeroable;
    use box::BoxTrait;

    struct Storage {
        _config: RoundConfig,
        _proposal_count: u32,
        _proposals: LegacyMap<u32, Proposal>,
        _leading_proposal_ids: Vec<u32>,
        _spent_voting_power: LegacyMap<EthAddress, u256>,
    }

    #[event]
    fn ProposalCreated(proposal_id: u32, proposer: EthAddress, metadata_uri: Array<felt252>) {}

    #[event]
    fn ProposalEdited(proposal_id: u32, updated_metadata_uri: Array<felt252>) {}

    #[event]
    fn ProposalCancelled(proposal_id: u32) {}

    #[event]
    fn VoteCast(proposal_id: u32, voter: EthAddress, voting_power: u256) {}

    #[event]
    fn RoundFinalized(winning_proposal_ids: Span<u32>, merkle_root: u256) {}

    impl TimedRound of ITimedRound {
        fn get_proposal(proposal_id: u32) -> Proposal {
            let proposal = _proposals::read(proposal_id);
            assert(proposal.proposer.is_non_zero(), 'TR: Proposal does not exist');

            proposal
        }

        fn propose(
            proposer: EthAddress,
            metadata_uri: Array<felt252>,
            used_proposing_strategies: Array<UserStrategy>,
        ) {
            let config = _config::read();
            let current_timestamp = get_block_timestamp();

            _assert_caller_valid_and_round_active();
            _assert_in_proposal_period(config, current_timestamp);

            // Determine the cumulative proposition power of the user
            let cumulative_proposition_power = Round::get_cumulative_governance_power(
                config.proposal_period_start_timestamp,
                proposer,
                StrategyType::PROPOSING,
                used_proposing_strategies.span(),
            );
            assert(
                cumulative_proposition_power >= config.proposal_threshold.into(),
                'TR: Proposition power too low'
            );

            let proposal_id = _proposal_count::read() + 1;
            let proposal = Proposal {
                proposer: proposer,
                last_updated_at: current_timestamp,
                is_cancelled: false,
                voting_power: 0,
            };

            // Store the proposal and increment the proposal count
            _proposals::write(proposal_id, proposal);
            _proposal_count::write(proposal_id);

            ProposalCreated(proposal_id, proposer, metadata_uri);
        }

        fn edit_proposal(proposer: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>) {
            _assert_caller_valid_and_round_active();
            _assert_in_proposal_period(_config::read(), get_block_timestamp());

            let mut proposal = _proposals::read(proposal_id);

            // Ensure the proposal exists, the caller is the proposer, and the proposal hasn't been cancelled
            assert(proposal.proposer.is_non_zero(), 'TR: Proposal does not exist');
            assert(proposer == proposal.proposer, 'TR: Caller is not proposer');
            assert(!proposal.is_cancelled, 'TR: Proposal is cancelled');

            // Set the last update timestamp
            proposal.last_updated_at = get_block_timestamp();
            _proposals::write(proposal_id, proposal);

            ProposalEdited(proposal_id, metadata_uri);
        }

        fn cancel_proposal(proposer: EthAddress, proposal_id: u32) {
            _assert_caller_valid_and_round_active();
            _assert_in_proposal_period(_config::read(), get_block_timestamp());

            let mut proposal = _proposals::read(proposal_id);

            // Ensure the proposal exists, the caller is the proposer, and the proposal hasn't been cancelled
            assert(proposal.proposer.is_non_zero(), 'TR: Proposal does not exist');
            assert(proposer == proposal.proposer, 'TR: Caller is not proposer');
            assert(!proposal.is_cancelled, 'TR: Proposal is cancelled');

            // Cancel the proposal
            proposal.is_cancelled = true;
            _proposals::write(proposal_id, proposal);

            ProposalCancelled(proposal_id);
        }

        fn vote(
            voter: EthAddress,
            proposal_votes: Array<ProposalVote>,
            used_voting_strategies: Array<UserStrategy>,
        ) {
            let config = _config::read();
            let current_timestamp = get_block_timestamp();

            _assert_caller_valid_and_round_active();
            _assert_in_vote_period(config, current_timestamp);

            // Determine the cumulative voting power of the user at the snapshot timestamp
            let snapshot_timestamp = config.proposal_period_end_timestamp;
            let cumulative_voting_power = Round::get_cumulative_governance_power(
                snapshot_timestamp, voter, StrategyType::VOTING, used_voting_strategies.span()
            );
            assert(cumulative_voting_power.is_non_zero(), 'TR: User has no voting power');

            // Cast votes, throwing if the remaining voting power is insufficient
            let mut leading_proposals = _get_leading_proposals();
            _cast_votes_on_one_or_more_proposals(
                voter, cumulative_voting_power, proposal_votes.span(), ref leading_proposals
            );
            _leading_proposal_ids::write(leading_proposals.index_to_pid);
        }

        fn cancel_round() {
            // Round cancellations can only come from an origin chain round
            Round::assert_caller_is_deployer();
            _assert_round_active();

            let mut config = _config::read();
            config.round_state = RoundState::Cancelled(());
            _config::write(config);
        }

        fn finalize_round(awards: Array<Asset>) {
            let mut config = _config::read();

            _assert_round_active();
            _assert_vote_period_has_ended(config);

            // If no awards were offered in the config, the awards array must be empty.
            // Otherwise, assert the validity of the provided awards.
            match config.award_hash.into() {
                0 => assert(awards.is_empty(), 'TR: Awards not empty'),
                _ => _assert_awards_valid(awards.span()),
            }

            // If no proposals were submitted, the round must be cancelled.
            let proposal_count = _proposal_count::read();
            assert(proposal_count.is_non_zero(), 'TR: No proposals submitted');

            let (winning_proposal_ids, winning_proposals) = _get_winning_proposal_ids_and_data();
            let leaves = _compute_leaves(winning_proposal_ids, winning_proposals, awards);

            let mut merkle_tree = MerkleTreeTrait::<u256>::new();
            let merkle_root = merkle_tree.compute_merkle_root(leaves);

            let execution_strategy_address = get_round_dependency_registry().get_dependency_at_key(
                Round::origin_chain_id(), RoundType::TIMED, DependencyKey::EXECUTION_STRATEGY
            );
            if execution_strategy_address.is_non_zero() {
                let execution_strategy = IExecutionStrategyDispatcher {
                    contract_address: execution_strategy_address, 
                };
                execution_strategy.execute(_build_execution_params(merkle_root));
            }

            config.round_state = RoundState::Finalized(());
            _config::write(config);

            RoundFinalized(winning_proposal_ids, merkle_root);
        }
    }

    #[constructor]
    fn constructor(round_params: Array<felt252>) {
        initializer(round_params.span());
    }

    /// Returns the proposal for the given proposal ID.
    /// * `proposal_id` - The proposal ID.
    #[view]
    fn get_proposal(proposal_id: u32) -> Proposal {
        TimedRound::get_proposal(proposal_id)
    }

    /// Submit a proposal to the round.
    /// * `proposer` - The address of the proposer.
    /// * `metadata_uri` - The proposal metadata URI.
    /// * `used_proposing_strategies` - The strategies used to propose.
    #[external]
    fn propose(
        proposer: EthAddress,
        metadata_uri: Array<felt252>,
        used_proposing_strategies: Array<UserStrategy>,
    ) {
        TimedRound::propose(proposer, metadata_uri, used_proposing_strategies);
    }

    /// Edit a proposal.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal to cancel.
    /// * `metadata_uri` - The updated proposal metadata URI.
    #[external]
    fn edit_proposal(proposer: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>) {
        TimedRound::edit_proposal(proposer, proposal_id, metadata_uri);
    }

    /// Cancel a proposal.
    /// * `proposer` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal to cancel.
    #[external]
    fn cancel_proposal(proposer: EthAddress, proposal_id: u32) {
        TimedRound::cancel_proposal(proposer, proposal_id);
    }

    /// Cast votes on one or more proposals.
    /// * `voter` - The address of the voter.
    /// * `proposal_votes` - The votes to cast.
    /// * `used_voting_strategies` - The strategies used to vote.
    #[external]
    fn vote(
        voter: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategies: Array<UserStrategy>,
    ) {
        TimedRound::vote(voter, proposal_votes, used_voting_strategies);
    }

    /// Cancel the round.
    #[external]
    fn cancel_round() {
        TimedRound::cancel_round();
    }

    /// Finalize the round by determining winners and relaying execution.
    /// * `awards` - The awards to distribute.
    #[external]
    fn finalize_round(awards: Array<Asset>) {
        TimedRound::finalize_round(awards);
    }

    ///
    /// Internals
    ///

    /// Initialize the round.
    fn initializer(round_params_: Span<felt252>) {
        let RoundParams {
            award_hash,
            proposal_period_start_timestamp,
            proposal_period_duration,
            vote_period_duration,
            winner_count,
            proposal_threshold,
            proposing_strategies,
            voting_strategies,
        } = _decode_param_array(round_params_);

        // The following bitand will be replaced with && once short-circuiting is supported.
        assert(proposal_period_start_timestamp.is_non_zero(), 'TR: Invalid PPST');
        assert(proposal_period_duration.is_non_zero(), 'TR: Invalid PPD');
        assert(vote_period_duration.is_non_zero(), 'TR: Invalid VPD');
        assert(winner_count.is_non_zero() & winner_count <= MAX_WINNERS, 'TR: Invalid winner count');
        assert(voting_strategies.len().is_non_zero(), 'TR: No voting strategies');

        let proposal_period_end_timestamp = proposal_period_start_timestamp + proposal_period_duration;
        let vote_period_end_timestamp = proposal_period_end_timestamp + vote_period_duration;

        _config::write(
            RoundConfig {
                round_state: RoundState::Active(()),
                winner_count,
                proposal_period_start_timestamp,
                proposal_period_end_timestamp,
                vote_period_end_timestamp,
                proposal_threshold,
                award_hash,
            }
        );

        let mut strategy_groups = Default::default();
        strategy_groups.append(
            StrategyGroup {
                strategy_type: StrategyType::PROPOSING, strategies: proposing_strategies
            },
        );
        strategy_groups.append(
            StrategyGroup {
                strategy_type: StrategyType::VOTING, strategies: voting_strategies
            },
        );
        Round::initializer(strategy_groups.span());
    }

    /// Decode the round parameters from an array of felt252s.
    /// * `params` - The array of felt252s.
    fn _decode_param_array(params: Span<felt252>) -> RoundParams {
        let award_hash = *params.at(0);
        let proposal_period_start_timestamp = (*params.at(1)).try_into().unwrap();
        let proposal_period_duration = (*params.at(2)).try_into().unwrap();
        let vote_period_duration = (*params.at(3)).try_into().unwrap();
        let winner_count = (*params.at(4)).try_into().unwrap();
        let proposal_threshold = *params.at(5);

        let (proposing_strategies, offset) = Round::parse_strategies(params, 6);
        let (voting_strategies, _) = Round::parse_strategies(params, offset);

        RoundParams {
            award_hash,
            proposal_period_start_timestamp,
            proposal_period_duration,
            vote_period_duration,
            winner_count,
            proposal_threshold,
            proposing_strategies,
            voting_strategies,
        }
    }

    /// Asserts that the round is active.
    fn _assert_round_active() {
        assert(_config::read().round_state == RoundState::Active(()), 'TR: Round not active');
    }

    /// Asserts that caller is a valid auth strategy and that the round is active.
    fn _assert_caller_valid_and_round_active() {
        Round::assert_caller_is_valid_auth_strategy(RoundType::TIMED);
        _assert_round_active();
    }

    /// Asserts that the provided awards are valid.
    fn _assert_awards_valid(awards: Span<Asset>) {
        let computed_award_hash = Round::compute_asset_hash(awards);
        let stored_award_hash = _config::read().award_hash;

        assert(computed_award_hash == stored_award_hash, 'TR: Invalid awards provided');
    }

    /// Asserts that the round is in the proposal period.
    /// * `config` - The round config.
    /// * `current_timestamp` - The current timestamp.
    fn _assert_in_proposal_period(config: RoundConfig, current_timestamp: u64) {
        assert(
            current_timestamp >= config.proposal_period_start_timestamp,
            'TR: Proposal period not started',
        );
        assert(
            current_timestamp < config.proposal_period_end_timestamp,
            'TR: Proposal period has ended',
        );
    }

    /// Asserts that the round is in the vote period.
    /// * `config` - The round config.
    /// * `current_timestamp` - The current timestamp.
    fn _assert_in_vote_period(config: RoundConfig, current_timestamp: u64) {
        let vote_period_start_timestamp = config.proposal_period_end_timestamp + 1;

        assert(current_timestamp >= vote_period_start_timestamp, 'TR: Vote period not started');
        assert(current_timestamp <= config.vote_period_end_timestamp, 'TR: Vote period has ended');
    }

    /// Asserts that the vote period has ended.
    /// * `config` - The round config.
    fn _assert_vote_period_has_ended(config: RoundConfig) {
        let current_timestamp = get_block_timestamp();
        assert(current_timestamp > config.vote_period_end_timestamp, 'TR: Vote period not ended');
    }

    /// Cast votes on one or more proposals.
    /// * `voter` - The address of the voter.
    /// * `cumulative_voting_power` - The cumulative voting power of the voter.
    /// * `proposal_votes` - The votes to cast.
    /// * `leading_proposals` - The leading proposals.
    fn _cast_votes_on_one_or_more_proposals(
        voter: EthAddress,
        cumulative_voting_power: u256,
        mut proposal_votes: Span<ProposalVote>,
        ref leading_proposals: LeadingProposals,
    ) {
        let mut spent_voting_power = _spent_voting_power::read(voter);
        let mut remaining_voting_power = cumulative_voting_power - spent_voting_power;
        loop {
            match proposal_votes.pop_front() {
                Option::Some(proposal_vote) => {
                    // Cast the votes for the proposal
                    spent_voting_power += _cast_votes_on_proposal(
                        voter, *proposal_vote, remaining_voting_power, ref leading_proposals,
                    );
                    remaining_voting_power = cumulative_voting_power - spent_voting_power;
                },
                Option::None(_) => {
                    // Update the spent voting power for the user
                    _spent_voting_power::write(voter, spent_voting_power);
                    break;
                },
            };
        };
    }

    /// Cast votes on a single proposal.
    /// * `voter` - The address of the voter.
    /// * `proposal_vote` - The proposal vote information.
    /// * `remaining_voting_power` - The remaining voting power of the voter.
    /// * `leading_proposals` - The leading proposals.
    fn _cast_votes_on_proposal(
        voter: EthAddress,
        proposal_vote: ProposalVote,
        remaining_voting_power: u256,
        ref leading_proposals: LeadingProposals,
    ) -> u256 {
        let proposal_id = proposal_vote.proposal_id;
        let voting_power = proposal_vote.voting_power;

        let mut proposal = _proposals::read(proposal_id);
        assert(proposal.proposer.is_non_zero(), 'TR: Proposal does not exist');

        // Exit early if the proposal has been cancelled
        if proposal.is_cancelled {
            return 0;
        }

        assert(voting_power.is_non_zero(), 'TR: No voting power provided');
        assert(remaining_voting_power >= voting_power, 'TR: Insufficient voting power');

        proposal.voting_power += voting_power;
        _proposals::write(proposal_id, proposal);

        let pid_or_null = leading_proposals.pid_to_index.get(proposal_id.into());
        _insert_or_update_leading_proposal(ref leading_proposals, pid_or_null, proposal_id, proposal);

        VoteCast(proposal_id, voter, voting_power);

        voting_power
    }

    /// Build the execution parameters that will be passed to the execution strategy.
    /// * `merkle_root` - The merkle root that will be used for asset claims.
    fn _build_execution_params(merkle_root: u256) -> Span<felt252> {
        let mut execution_params = Default::default();
        execution_params.append(merkle_root.low.into());
        execution_params.append(merkle_root.high.into());

        execution_params.span()
    }

    /// Compute the leaves for the given proposals and awards, if present.
    /// * `proposal_ids` - The proposal IDs to compute the leaves for.
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `awards` - The awards to compute the leaves for.
    fn _compute_leaves(proposal_ids: Span<u32>, proposals: Span<Proposal>, awards: Array<Asset>) -> Span<u256> {
        if awards.is_empty() {
            return _compute_leaves_for_no_awards(proposal_ids, proposals);
        }
        if awards.len() == 1 {
            return _compute_leaves_for_split_award(proposal_ids, proposals, *awards.at(0));
        }
        _compute_leaves_for_assigned_awards(proposal_ids, proposals, awards)
    }

    /// Compute the leaves for the given proposals using the proposer address
    /// and rank of the proposal.
    /// * `proposal_ids` - The proposal IDs to compute the leaves for.
    /// * `proposals` - The proposals to compute the leaves for.
    fn _compute_leaves_for_no_awards(proposal_ids: Span<u32>, mut proposals: Span<Proposal>) -> Span<u256> {
        let mut leaves = Default::<Array<u256>>::default();

        let mut position = 0;
        loop {
            match proposals.pop_front() {
                Option::Some(p) => {
                    let proposal_id = *proposal_ids.at(position);

                    position += 1;
                    leaves.append(_compute_winner_leaf(proposal_id, position, *p.proposer));
                },
                Option::None(_) => {
                    break leaves.span();
                },
            };
        }
    }

    /// Compute the leaves for the given proposals using an award that is to be split
    /// evenly among the them.
    /// * `proposal_ids` - The proposal IDs to compute the leaves for.
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `award_to_split` - The award to split evenly among the proposals.
    fn _compute_leaves_for_split_award(
        proposal_ids: Span<u32>, proposals: Span<Proposal>, award_to_split: Asset
    ) -> Span<u256> {
        let proposal_len: felt252 = proposals.len().into();
        let amount_per_proposal = award_to_split.amount / proposal_len.into();

        let mut leaves = Default::<Array<u256>>::default();
        let proposal_count = proposals.len();

        let mut position = 0;
        loop {
            if position == proposal_count {
                break leaves.span();
            }
            let proposal_id = *proposal_ids.at(position);
            let p = *proposals.at(position);

            position += 1;
            leaves.append(
                _compute_winner_leaf_with_award(
                    proposal_id, position, p.proposer, award_to_split.asset_id, amount_per_proposal
                )
            );
        }
    }

    /// Compute the leaves for the given proposals using awards that are to be assigned
    /// to each proposal individually.
    /// * `proposal_ids` - The proposal IDs to compute the leaves for.
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `awards` - The awards to assign to each proposal.
    fn _compute_leaves_for_assigned_awards(
        proposal_ids: Span<u32>, proposals: Span<Proposal>, awards: Array<Asset>
    ) -> Span<u256> {
        let proposal_count = proposals.len();
        let mut leaves = Default::<Array<u256>>::default();

        let mut position = 0;
        loop {
            if position == proposal_count {
                break leaves.span();
            }
            let award = *awards.at(position);
            let proposal_id = *proposal_ids.at(position);
            let p = *proposals.at(position);

            position += 1;
            leaves.append(
                _compute_winner_leaf_with_award(
                    proposal_id, position, p.proposer, award.asset_id, award.amount
                )
            );
        }
    }

    /// Compute a single leaf consisting of a proposal id, proposal rank,
    /// and proposer address.
    /// * `proposal_id` - The ID of the proposal.
    /// * `proposer` - The proposer of the proposal.
    /// * `position` - The rank of the proposal in the winning set.
    fn _compute_winner_leaf(proposal_id: u32, position: u32, proposer: EthAddress) -> u256 {
        let mut leaf_input = Default::default();
        leaf_input.append(u256_from_felt252(proposal_id.into()));
        leaf_input.append(u256_from_felt252(position.into()));
        leaf_input.append(u256_from_felt252(proposer.into()));

        keccak_u256s_be(leaf_input.span())
    }

    /// Compute a single leaf consisting of a proposal ID, proposal rank,
    /// proposer address, asset ID, and asset amount.
    /// * `proposal_id` - The ID of the proposal.
    /// * `position` - The rank of the proposal in the winning set.
    /// * `proposer` - The proposer of the proposal.
    /// * `asset_id` - The ID of the asset to award.
    /// * `asset_amount` - The amount of the asset to award.
    fn _compute_winner_leaf_with_award(
        proposal_id: u32, position: u32, proposer: EthAddress, asset_id: u256, asset_amount: u256
    ) -> u256 {
        let mut leaf_input = Default::default();
        leaf_input.append(u256_from_felt252(proposal_id.into()));
        leaf_input.append(u256_from_felt252(position.into()));
        leaf_input.append(u256_from_felt252(proposer.into()));
        leaf_input.append(asset_id);
        leaf_input.append(asset_amount);

        keccak_u256s_be(leaf_input.span())
    }

    /// Get the ID <-> index mappings for proposals currently in the lead.
    /// Proposals must receive at least one vote to be considered.
    fn _get_leading_proposals() -> LeadingProposals {
        let mut index_to_pid = _leading_proposal_ids::read();
        let mut pid_to_index = Default::default();
        let count = index_to_pid.len();

        let mut i = 0;
        loop {
            if i == count {
                break;
            }
            pid_to_index.insert(index_to_pid.at(i).into(), nullable_from_box(BoxTrait::new(i)));

            i += 1;
        };
        LeadingProposals { index_to_pid, pid_to_index }
    }

    /// Get the winning proposal IDs and full proposal information.
    fn _get_winning_proposal_ids_and_data() -> (Span<u32>, Span<Proposal>) {
        let mut winning_proposals = _get_leading_proposals();
        let mut effective_heap_size = winning_proposals.index_to_pid.len();

        // Get the winning proposal IDs in ascending order, which is cheaper
        // due to the min heap.
        let mut winning_proposal_ids_asc = Default::<Array<u32>>::default();
        loop {
            if effective_heap_size == 0 {
                break;
            }
            effective_heap_size -= 1;
            winning_proposal_ids_asc.append(_pop_least_voted_proposal(ref winning_proposals, effective_heap_size));
        };

        let mut winning_proposal_ids = Default::<Array<u32>>::default();
        let mut winning_proposal_data = Default::<Array<Proposal>>::default();

        // Reverse the order of the proposals.
        let mut i = winning_proposal_ids_asc.len();
        loop {
            if i == 0 {
                break (winning_proposal_ids.span(), winning_proposal_data.span());
            }
            i -= 1;

            let proposal_id = *winning_proposal_ids_asc.at(i);
            winning_proposal_ids.append(proposal_id);
            winning_proposal_data.append(_proposals::read(proposal_id));
        }
    }

    /// Get the proposal ID with the smallest amount of voting power
    /// and "removing" it by moving it to the end of the heap.
    /// * `winning_proposals` - The winning proposals.
    /// * `heap_last_index` - The index of the last element in the heap.
    fn _pop_least_voted_proposal(ref winning_proposals: LeadingProposals, heap_last_index: u32) -> u32 {
        let root = winning_proposals.index_to_pid.at(0);
        let last = winning_proposals.index_to_pid.at(heap_last_index);

        // Swap the root with the last element
        _set_proposal_id_index(ref winning_proposals, 0, last);
        _set_proposal_id_index(ref winning_proposals, heap_last_index, root);

        // Bubble down the new root
        _bubble_down_proposal_in_heap(ref winning_proposals, 0);

        // Return the minimum value
        winning_proposals.index_to_pid.at(heap_last_index)
    }

    /// Insert or update a proposal in the leading proposals vec.
    /// * `leading_proposals` - The leading proposals.
    /// * `pid_or_null` - The index of the proposal, if it exists.
    /// * `proposal_id` - The ID of the proposal.
    /// * `proposal` - The proposal information.
    fn _insert_or_update_leading_proposal(ref leading_proposals: LeadingProposals, pid_or_null: Nullable<u32>, proposal_id: u32, proposal: Proposal) {
        match match_nullable(pid_or_null) {
            // Insert
            FromNullableResult::Null(()) => {
                let winner_count = _config::read().winner_count;
                let leading_proposals_count = leading_proposals.index_to_pid.len();

                _handle_proposal_insertion_or_replacement(ref leading_proposals, leading_proposals_count, winner_count, proposal_id, proposal);
            },
            // Update
            FromNullableResult::NotNull(proposal_index) => _bubble_up_proposal_in_heap(
                ref leading_proposals, proposal_index.unbox()
            ),
        }
    }

    /// Insert a proposal into the leading proposals vec if it is not full,
    /// or replace the root proposal if it has a lower voting power.
    /// * `leading_proposals` - The leading proposals.
    /// * `leading_proposals_count` - The number of leading proposals.
    /// * `winner_count` - The number of winners.
    /// * `proposal_id` - The ID of the proposal.
    /// * `proposal` - The proposal information.
    fn _handle_proposal_insertion_or_replacement(
        ref leading_proposals: LeadingProposals,
        leading_proposals_count: u32,
        winner_count: u16,
        proposal_id: u32,
        proposal: Proposal,
    ) {
        // If winner count has not been reached, insert the proposal without removing another
        if leading_proposals_count < winner_count.into() {
            _insert_proposal(ref leading_proposals, leading_proposals_count, proposal_id);
            _bubble_up_proposal_in_heap(ref leading_proposals, leading_proposals_count);
        } else if _should_replace_least_voted_proposal(ref leading_proposals, proposal) {
            _replace_proposal(ref leading_proposals, 0, proposal_id);
        }
    }

    /// Insert a new proposal into the leading proposals vec.
    /// * `leading_proposals` - The leading proposals.
    /// * `index` - The starting index of the proposal.
    /// * `proposal_id` - The ID of the proposal.
    fn _insert_proposal(ref leading_proposals: LeadingProposals, index: u32, proposal_id: u32) {
        leading_proposals.pid_to_index.insert(proposal_id.into(), nullable_from_box(BoxTrait::new(index)));
        leading_proposals.index_to_pid.push(proposal_id);
    }

    /// Replace the proposal at the given index with the given proposal ID.
    /// * `leading_proposals` - The leading proposals.
    /// * `index` - The index of the proposal.
    /// * `proposal_id` - The ID of the proposal.
    fn _replace_proposal(ref leading_proposals: LeadingProposals, index: u32, proposal_id: u32) {
        _set_proposal_id_index(ref leading_proposals, index, proposal_id);
        _bubble_down_proposal_in_heap(ref leading_proposals, index);
    }

    /// Return true if the given voting power is greater than the least voted (root) proposal's voting power,
    /// OR if the voting power is equal to the least voted proposal's voting power, but the last updated
    /// timestamp is less than the least voted proposal's last updated timestamp.
    /// * `leading_proposals` - The leading proposals.
    /// * `proposal` - The proposal information.
    fn _should_replace_least_voted_proposal(ref leading_proposals: LeadingProposals, proposal: Proposal) -> bool {
        let least_voted_proposal = _proposals::read(leading_proposals.index_to_pid.at(0));

        if proposal.voting_power > least_voted_proposal.voting_power {
            true
        } else if proposal.voting_power < least_voted_proposal.voting_power {
            false
        } else {
            proposal.last_updated_at < least_voted_proposal.last_updated_at
        }
    }

    /// Bubble the proposal at the given index up the heap. Despite this being a min-heap,
    /// we need to bubble up instead of down when a node's value increases, because voting
    /// power can only increase, never decrease. So, if the proposal's voting power is larger
    /// than its parent OR the proposal's voting power is equal to its parent and was received
    /// first, it will swap the proposal with its parent. The loop continues until it reaches
    /// a point where the proposal's voting power is less than its parent's or the voting power
    /// is equal and the proposal was received at the same time or after its parent.
    /// * `leading_proposals` - The leading proposals.
    /// * `index` - The index of the proposal to bubble up.
    fn _bubble_up_proposal_in_heap(ref leading_proposals: LeadingProposals, mut index: u32) {
        loop {
            if index == 0 {
                break;
            }
            let parent_index = (index - 1) / 2;
            let parent_proposal_id = leading_proposals.index_to_pid.at(parent_index);
            let proposal_id = leading_proposals.index_to_pid.at(index);

            let proposal = _proposals::read(proposal_id);
            let parent_proposal = _proposals::read(parent_proposal_id);

            if proposal.voting_power < parent_proposal.voting_power {
                break;
            }
            // This bitand will be replaced with && once short-circuiting is supported.
            if proposal.voting_power == parent_proposal.voting_power & proposal.last_updated_at >= parent_proposal.last_updated_at {
                break;
            }

            // Swap the current proposal with its parent.
            _set_proposal_id_index(ref leading_proposals, index, parent_proposal_id);
            _set_proposal_id_index(ref leading_proposals, parent_index, proposal_id);

            index = parent_index;
        };
    }

    /// Bubble the proposal at the given index down the heap. This function is used
    /// when the root proposal is replaced in a full heap. The function ensures that
    /// the heap property is maintained after such updates. Specifically, it checks if
    /// the updated proposal (at the given index) has a lower voting power than one of
    /// its children or if the voting power is equal and the proposal was received after
    /// its child. If so, it swaps the proposal with its highest voting power child.
    /// This process continues (i.e., it "bubbles down" the proposal) until the proposal
    /// has higher voting power than both its children or equal voting power and was
    /// received before its child, or until it becomes a leaf node.
    /// * `leading_proposals` - The leading proposals.
    /// * `index` - The index of the proposal to bubble down.
    fn _bubble_down_proposal_in_heap(ref leading_proposals: LeadingProposals, mut index: u32) {
        let leading_proposals_count = leading_proposals.index_to_pid.len();
        loop {
            let left_child_index = 2 * index + 1;
            let right_child_index = 2 * index + 2;

            // If there are no children, break the loop.
            if left_child_index >= leading_proposals_count {
                break;
            }

            // Find the index of the child with the highest voting power.
            let max_child_index = if right_child_index < leading_proposals_count {
                let left_child_proposal_id = leading_proposals.index_to_pid.at(left_child_index);
                let right_child_proposal_id = leading_proposals.index_to_pid.at(right_child_index);
                let left_child_proposal = _proposals::read(left_child_proposal_id);
                let right_child_proposal = _proposals::read(right_child_proposal_id);

                if left_child_proposal.voting_power > right_child_proposal.voting_power {
                    left_child_index
                // This bitand will be replaced with && once short-circuiting is supported.
                } else if left_child_proposal.voting_power == right_child_proposal.voting_power & left_child_proposal.last_updated_at < right_child_proposal.last_updated_at  {
                    left_child_index
                } else {
                    right_child_index
                }
            } else {
                left_child_index
            };

            let proposal_id = leading_proposals.index_to_pid.at(index);
            let max_child_proposal_id = leading_proposals.index_to_pid.at(max_child_index);
            let proposal = _proposals::read(proposal_id);
            let max_child_proposal = _proposals::read(max_child_proposal_id);

            if proposal.voting_power > max_child_proposal.voting_power {
                break;
            }
            // This bitand will be replaced with && once short-circuiting is supported.
            if proposal.voting_power == max_child_proposal.voting_power & proposal.last_updated_at <= max_child_proposal.last_updated_at {
                break;
            }

            // Swap the current proposal with its max child.
            _set_proposal_id_index(ref leading_proposals, index, max_child_proposal_id);
            _set_proposal_id_index(ref leading_proposals, max_child_index, proposal_id);

            index = max_child_index;
        };
    }

    /// Set the proposal ID at the given index in the map of leading proposals.
    /// * `leading_proposals` - The leading proposals.
    /// * `index` - The index to set.
    /// * `proposal_id` - The proposal ID to set.
    fn _set_proposal_id_index(ref leading_proposals: LeadingProposals, index: u32, proposal_id: u32) {
        leading_proposals.index_to_pid.set(index, proposal_id);
        leading_proposals.pid_to_index.insert(proposal_id.into(), nullable_from_box(BoxTrait::new(index)));
    }
}
