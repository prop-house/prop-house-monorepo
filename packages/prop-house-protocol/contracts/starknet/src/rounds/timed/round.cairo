#[contract]
mod TimedRound {
    use starknet::{EthAddress, get_block_timestamp, get_caller_address};
    use prop_house::rounds::timed::config::{
        ITimedRound, RoundState, RoundConfig, RoundParams, Proposal, ProposalWithId, ProposalVote
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
    use prop_house::common::utils::merkle::MerkleTreeTrait;
    use prop_house::common::utils::serde::SpanSerde;
    use array::{ArrayTrait, SpanTrait};
    use integer::u256_from_felt252;
    use traits::{TryInto, Into};
    use option::OptionTrait;
    use zeroable::Zeroable;

    struct Storage {
        _config: RoundConfig,
        _proposal_count: u32,
        _proposals: LegacyMap<u32, Proposal>,
        _spent_voting_power: LegacyMap<EthAddress, u256>,
    }

    #[event]
    fn ProposalCreated(
        proposal_id: u32, proposer: EthAddress, metadata_uri: Array<felt252>
    ) {}

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

        fn edit_proposal(
            proposer: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>
        ) {
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
                snapshot_timestamp,
                voter,
                StrategyType::VOTING,
                used_voting_strategies.span(),
            );
            assert(cumulative_voting_power.is_non_zero(), 'TR: User has no voting power');

            // Cast votes, throwing if the remaining voting power is insufficient
            _cast_votes_on_one_or_more_proposals(
                voter, cumulative_voting_power, proposal_votes.span()
            );
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

            // Determine the winners and compute the a merkle root with the claim information.
            let active_proposals = _get_active_proposals();
            let winning_proposals = _get_n_proposals_by_voting_power_desc(
                active_proposals, config.winner_count.into()
            );
            let leaves = _compute_leaves(winning_proposals, awards);

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

            RoundFinalized(_extract_proposal_ids(winning_proposals), merkle_root);
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
    fn _cast_votes_on_one_or_more_proposals(
        voter: EthAddress,
        cumulative_voting_power: u256,
        mut proposal_votes: Span<ProposalVote>
    ) {
        let mut spent_voting_power = _spent_voting_power::read(voter);
        let mut remaining_voting_power = cumulative_voting_power - spent_voting_power;
        loop {
            match proposal_votes.pop_front() {
                Option::Some(proposal_vote) => {
                    // Cast the votes for the proposal
                    spent_voting_power += _cast_votes_on_proposal(
                        voter, *proposal_vote, remaining_voting_power, 
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
    fn _cast_votes_on_proposal(
        voter: EthAddress, proposal_vote: ProposalVote, remaining_voting_power: u256, 
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

        VoteCast(proposal_id, voter, voting_power);

        voting_power
    }

    /// Get all active proposals (not cancelled), including proposal IDs.
    fn _get_active_proposals() -> Array<ProposalWithId> {
        let mut active_proposals = Default::default();

        let mut id = 1;
        let proposal_count = _proposal_count::read();
        loop {
            if id > proposal_count {
                break;
            }

            let proposal = _proposals::read(id);
            if !proposal.is_cancelled {
                active_proposals.append(ProposalWithId { proposal_id: id, proposal });
            }
            id += 1;
        };
        active_proposals
    }

    /// Return an array of all the proposal IDs in the given array of proposals.
    /// * `proposals` - Array of proposals
    fn _extract_proposal_ids(mut proposals: Span<ProposalWithId>) -> Span<u32> {
        let mut proposal_ids = Default::<Array<u32>>::default();
        loop {
            match proposals.pop_front() {
                Option::Some(p) => {
                    proposal_ids.append(*p.proposal_id);
                },
                Option::None(_) => {
                    break;
                },
            };
        };
        proposal_ids.span()
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
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `awards` - The awards to compute the leaves for.
    fn _compute_leaves(proposals: Span<ProposalWithId>, awards: Array<Asset>) -> Span<u256> {
        if awards.is_empty() {
            return _compute_leaves_for_no_awards(proposals);
        }
        if awards.len() == 1 {
            return _compute_leaves_for_split_award(proposals, *awards.at(0));
        }
        _compute_leaves_for_assigned_awards(proposals, awards)
    }

    /// Compute the leaves for the given proposals using the proposer address
    /// and rank of the proposal.
    /// * `proposals` - The proposals to compute the leaves for.
    fn _compute_leaves_for_no_awards(mut proposals: Span<ProposalWithId>) -> Span<u256> {
        let mut leaves = Default::<Array<u256>>::default();

        let mut position = 1;
        loop {
            match proposals.pop_front() {
                Option::Some(p) => {
                    let proposal_id = *p.proposal_id;
                    let proposer = *p.proposal.proposer;
                    leaves.append(_compute_winner_leaf(proposal_id, position, proposer));
                    position += 1;
                },
                Option::None(_) => {
                    break leaves.span();
                },
            };
        }
    }

    /// Compute the leaves for the given proposals using an award that is to be split
    /// evenly among the them.
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `award_to_split` - The award to split evenly among the proposals.
    fn _compute_leaves_for_split_award(
        proposals: Span<ProposalWithId>, award_to_split: Asset
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
            let p = *proposals.at(position);

            position += 1;
            leaves.append(
                _compute_winner_leaf_with_award(
                    p.proposal_id, position, p.proposal.proposer, award_to_split.asset_id, amount_per_proposal
                )
            );
        }
    }

    /// Compute the leaves for the given proposals using awards that are to be assigned
    /// to each proposal individually.
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `awards` - The awards to assign to each proposal.
    fn _compute_leaves_for_assigned_awards(
        proposals: Span<ProposalWithId>, awards: Array<Asset>
    ) -> Span<u256> {
        let proposal_count = proposals.len();
        let mut leaves = Default::<Array<u256>>::default();

        let mut position = 0;
        loop {
            if position == proposal_count {
                break leaves.span();
            }
            let award = *awards.at(position);
            let p = *proposals.at(position);

            position += 1;
            leaves.append(
                _compute_winner_leaf_with_award(
                    p.proposal_id, position, p.proposal.proposer, award.asset_id, award.amount
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

    /// Get the top N proposals by descending voting power.
    /// Ties go to the proposal with the earliest `last_updated_at` timestamp.
    /// * `proposals` - Array of proposals to sort
    /// * `max_return_count` - Max number of proposals to return
    fn _get_n_proposals_by_voting_power_desc(
        mut proposals: Array<ProposalWithId>, max_return_count: u32
    ) -> Span<ProposalWithId> {
        _mergesort_proposals_by_voting_power_desc_and_slice(proposals, max_return_count).span()
    }

    /// Merge sort and slice an array of proposals by descending voting power.
    /// Ties go to the proposal with the earliest `last_updated_at` timestamp.
    /// * `arr` - Array of proposals to sort
    /// * `max_return_count` - Max return count
    fn _mergesort_proposals_by_voting_power_desc_and_slice(
        mut arr: Array<ProposalWithId>, max_return_count: u32
    ) -> Array<ProposalWithId> {
        let len = arr.len();
        if len <= 1 {
            return arr;
        }

        // Create left and right arrays
        let middle = len / 2;
        let (left_arr, right_arr) = _split_array(ref arr, middle);

        // Recursively sort the left and right arrays
        let sorted_left = _mergesort_proposals_by_voting_power_desc_and_slice(
            left_arr, max_return_count
        );
        let sorted_right = _mergesort_proposals_by_voting_power_desc_and_slice(
            right_arr, max_return_count
        );

        let mut result_arr = Default::default();
        _merge_and_slice_recursive(
            sorted_left, sorted_right, ref result_arr, 0, 0, max_return_count
        );
        result_arr
    }

    /// Merge two sorted proposal arrays.
    /// * `left_arr` - Left array
    /// * `right_arr` - Right array
    /// * `result_arr` - Result array
    /// * `left_arr_ix` - Left array index
    /// * `right_arr_ix` - Right array index
    /// * `max_return_count` - Max return count
    fn _merge_and_slice_recursive(
        mut left_arr: Array<ProposalWithId>,
        mut right_arr: Array<ProposalWithId>,
        ref result_arr: Array<ProposalWithId>,
        left_arr_ix: usize,
        right_arr_ix: usize,
        max_return_count: u32,
    ) {
        if result_arr.len() == left_arr.len() + right_arr.len() {
            return;
        }

        // Exit early if the max return count has been reached
        if result_arr.len() == max_return_count {
            return;
        }

        let (append, next_left_ix, next_right_ix) = if left_arr_ix == left_arr.len() {
            (*right_arr[right_arr_ix], left_arr_ix, right_arr_ix + 1)
        } else if right_arr_ix == right_arr.len() {
            (*left_arr[left_arr_ix], left_arr_ix + 1, right_arr_ix)
        } else if *left_arr[left_arr_ix].proposal.voting_power > *right_arr[right_arr_ix].proposal.voting_power {
            (*left_arr[left_arr_ix], left_arr_ix + 1, right_arr_ix)
        } else if *left_arr[left_arr_ix].proposal.voting_power < *right_arr[right_arr_ix].proposal.voting_power {
            (*right_arr[right_arr_ix], left_arr_ix, right_arr_ix + 1)
        } else if *left_arr[left_arr_ix].proposal.last_updated_at <= *right_arr[right_arr_ix].proposal.last_updated_at {
            (*left_arr[left_arr_ix], left_arr_ix + 1, right_arr_ix)
        } else {
            (*right_arr[right_arr_ix], left_arr_ix, right_arr_ix + 1)
        };

        result_arr.append(append);
        _merge_and_slice_recursive(left_arr, right_arr, ref result_arr, next_left_ix, next_right_ix, max_return_count);
    }

    // Split an array into two arrays.
    /// * `arr` - The array to split.
    /// * `index` - The index to split the array at.
    /// # Returns
    /// * `(Array<T>, Array<T>)` - The two arrays.
    fn _split_array<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>>(
        ref arr: Array<T>, index: usize
    ) -> (Array::<T>, Array::<T>) {
        let mut arr1 = Default::default();
        let mut arr2 = Default::default();
        let len = arr.len();

        _fill_array(ref arr1, ref arr, 0, index);
        _fill_array(ref arr2, ref arr, index, len - index);

        (arr1, arr2)
    }

    // Fill an array with a value.
    /// * `arr` - The array to fill.
    /// * `fill_arr` - The array to fill with.
    /// * `index` - The index to start filling at.
    /// * `count` - The number of elements to fill.
    /// # Returns
    /// * `Array<T>` - The filled array.
    fn _fill_array<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>>(
        ref arr: Array<T>, ref fill_arr: Array<T>, index: usize, count: usize
    ) {
        if count == 0 {
            return;
        }

        arr.append(*fill_arr[index]);

        _fill_array(ref arr, ref fill_arr, index + 1, count - 1)
    }
}
