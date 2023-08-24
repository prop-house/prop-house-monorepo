#[starknet::contract]
mod InfiniteRound {
    use starknet::{EthAddress, get_block_timestamp};
    use prop_house::rounds::infinite::config::{
        IInfiniteRound, RoundState, RoundParams, RoundConfig, Proposal, ProposalState, ProposalVote,
        VoteDirection,
    };
    use prop_house::rounds::infinite::constants::{MAX_WINNER_TREE_DEPTH, MAX_REQUESTED_ASSET_COUNT};
    use prop_house::common::libraries::round::{Asset, Round, UserStrategy, StrategyGroup};
    use prop_house::common::utils::contract::get_round_dependency_registry;
    use prop_house::common::utils::traits::{
        IExecutionStrategyDispatcherTrait, IExecutionStrategyDispatcher,
        IRoundDependencyRegistryDispatcherTrait,
    };
    use prop_house::common::utils::hash::{keccak_u256s_be, LegacyHashEthAddress};
    use prop_house::common::utils::constants::{DependencyKey, RoundType, StrategyType};
    use prop_house::common::utils::merkle::IncrementalMerkleTreeTrait;
    use prop_house::common::utils::array::assert_no_duplicates_u256;
    use prop_house::common::utils::storage::SpanStore;
    use nullable::{match_nullable, FromNullableResult};
    use array::{ArrayTrait, SpanTrait};
    use integer::u256_from_felt252;
    use traits::{TryInto, Into};
    use dict::Felt252DictTrait;
    use option::OptionTrait;
    use zeroable::Zeroable;
    use box::BoxTrait;

    #[storage]
    struct Storage {
        _config: RoundConfig,
        _proposal_count: u32,
        _winner_count: u32,
        _processed_winner_count: u32,
        _winner_merkle_root: u256,
        _winner_merkle_sub_trees: LegacyMap<u32, Span<u256>>,
        _proposals: LegacyMap<u32, Proposal>,
        _spent_voting_power: LegacyMap<(EthAddress, u32, u16), u256>,
    }

   #[event]
   #[derive(Drop, starknet::Event)]
    enum Event {
        ProposalCreated: ProposalCreated,
        ProposalEdited: ProposalEdited,
        ProposalCancelled: ProposalCancelled,
        ProposalApproved: ProposalApproved,
        ProposalRejected: ProposalRejected,
        VoteCast: VoteCast,
        WinnersProcessed: WinnersProcessed,
        RoundFinalized: RoundFinalized,
    }

    /// Emitted when a proposal is created.
    /// * `proposal_id` - The ID of the proposal.
    /// * `proposer` - The address of the proposer.
    /// * `metadata_uri` - The URI of the metadata.
    /// * `requested_assets` - The assets requested in the proposal.
    #[derive(Drop, starknet::Event)]
    struct ProposalCreated {
        proposal_id: u32,
        proposer: EthAddress,
        metadata_uri: Array<felt252>,
        requested_assets: Array<Asset>,
    }

    /// Emitted when a proposal is edited.
    /// * `proposal_id` - The ID of the proposal.
    /// * `updated_metadata_uri` - The updated URI of the metadata.
    /// * `updated_requested_assets` - The updated assets requested in the proposal.
    #[derive(Drop, starknet::Event)]
    struct ProposalEdited {
        proposal_id: u32,
        updated_metadata_uri: Array<felt252>,
        updated_requested_assets: Array<Asset>,
    }

    /// Emitted when a proposal is cancelled.
    /// * `proposal_id` - The ID of the cancelled proposal.
    #[derive(Drop, starknet::Event)]
    struct ProposalCancelled {
        proposal_id: u32,
    }

    /// Emitted when a proposal is approved.
    /// * `proposal_id` - The ID of the approved proposal.
    #[derive(Drop, starknet::Event)]
    struct ProposalApproved {
        proposal_id: u32,
    }

    /// Emitted when a proposal is rejected.
    /// * `proposal_id` - The ID of the rejected proposal.
    #[derive(Drop, starknet::Event)]
    struct ProposalRejected {
        proposal_id: u32,
    }

    /// Emitted when a vote is cast.
    /// * `proposal_id` - The ID of the proposal.
    /// * `voter` - The address of the voter.
    /// * `voting_power` - The voting power of the voter.
    /// * `direction` - The direction of the vote.
    #[derive(Drop, starknet::Event)]
    struct VoteCast {
        proposal_id: u32,
        voter: EthAddress,
        voting_power: u256,
        direction: VoteDirection,
    }

    /// Emitted when winners are processed.
    /// * `total_winner_count` - The total number of winners.
    /// * `merkle_root` - The Merkle root of the winners.
    #[derive(Drop, starknet::Event)]
    struct WinnersProcessed {
        total_winner_count: u32,
        merkle_root: u256,
    }

    /// Emitted when a round is finalized.
    #[derive(Drop, starknet::Event)]
    struct RoundFinalized {}

    #[constructor]
    fn constructor(ref self: ContractState, round_params: Array<felt252>) {
        initializer(ref self, round_params.span());
    }

    #[external(v0)]
    impl InfiniteRound of IInfiniteRound<ContractState> {
        /// Returns the proposal for the given proposal ID.
        /// * `proposal_id` - The proposal ID.
        fn get_proposal(self: @ContractState, proposal_id: u32) -> Proposal {
            let proposal = self._proposals.read(proposal_id);
            assert(proposal.proposer.is_non_zero(), 'IR: Proposal does not exist');

            proposal
        }

        /// Submit a proposal to the round.
        /// * `proposer` - The address of the proposer.
        /// * `metadata_uri` - The proposal metadata URI.
        /// * `requested_assets` - The assets requested by the proposal.
        /// * `used_proposing_strategies` - The strategies used to propose.
        fn propose(
            ref self: ContractState,
            proposer: EthAddress,
            metadata_uri: Array<felt252>,
            requested_assets: Array<Asset>,
            used_proposing_strategies: Array<UserStrategy>,
        ) {
            _assert_caller_valid_and_round_active(@self);
            _assert_asset_request_valid(requested_assets.span());

            let config = self._config.read();

            // Determine the cumulative proposition power of the user
            let cumulative_proposition_power = Round::get_cumulative_governance_power(
                @Round::unsafe_new_contract_state(),
                config.start_timestamp,
                proposer,
                StrategyType::PROPOSING,
                used_proposing_strategies.span(),
            );
            assert(
                cumulative_proposition_power >= config.proposal_threshold.into(),
                'IR: Proposition power too low'
            );

            let requested_assets_hash = Round::compute_asset_hash(requested_assets.span());
            let proposal_id = self._proposal_count.read() + 1;
            let proposal = Proposal {
                proposer,
                version: 1,
                state: ProposalState::Active(()),
                received_at: get_block_timestamp(),
                requested_assets_hash,
                voting_power_for: 0,
                voting_power_against: 0,
            };

            // Store the proposal and increment the proposal count
            self._proposals.write(proposal_id, proposal);
            self._proposal_count.write(proposal_id);

            self.emit(Event::ProposalCreated(ProposalCreated { proposal_id, proposer, metadata_uri, requested_assets }));
        }

        /// Edit a proposal.
        /// * `proposer` - The address of the proposer.
        /// * `proposal_id` - The ID of the proposal to cancel.
        /// * `metadata_uri` - The updated proposal metadata URI.
        /// * `requested_assets` - The updated assets requested by the proposal.
        fn edit_proposal(
            ref self: ContractState, proposer: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>, requested_assets: Array<Asset>,
        ) {
            let mut proposal = self._proposals.read(proposal_id);

            _assert_caller_valid_and_round_active(@self);
            _assert_can_modify_proposal(@self, proposer, proposal);
            _assert_asset_request_valid(requested_assets.span());

            // Increment the proposal version, update the requested assets, clear all votes,
            // and emit the metadata URI. If a proposer attempts to evade the against vote threshold
            // by editing the proposal, voters can simply let the proposal go stale.
            proposal.version += 1;
            proposal.voting_power_for = 0;
            proposal.voting_power_against = 0;
            proposal.requested_assets_hash = Round::compute_asset_hash(requested_assets.span());
            self._proposals.write(proposal_id, proposal);

            self.emit(Event::ProposalEdited(
                ProposalEdited { proposal_id, updated_metadata_uri: metadata_uri, updated_requested_assets: requested_assets },
            ));
        }

        /// Cancel a proposal.
        /// * `proposer` - The address of the proposer.
        /// * `proposal_id` - The ID of the proposal to cancel.
        fn cancel_proposal(ref self: ContractState, proposer: EthAddress, proposal_id: u32) {
            let mut proposal = self._proposals.read(proposal_id);

            _assert_caller_valid_and_round_active(@self);
            _assert_can_modify_proposal(@self, proposer, proposal);

            // Cancel the proposal
            proposal.state = ProposalState::Cancelled(());
            self._proposals.write(proposal_id, proposal);

            self.emit(Event::ProposalCancelled(ProposalCancelled { proposal_id }));
        }

        /// Cast votes on one or more proposals.
        /// * `voter` - The address of the voter.
        /// * `proposal_votes` - The votes to cast.
        /// * `used_voting_strategies` - The strategies used to vote.
        fn vote(
            ref self: ContractState,
            voter: EthAddress,
            proposal_votes: Array<ProposalVote>,
            used_voting_strategies: Array<UserStrategy>,
        ) {
            _assert_caller_valid_and_round_active(@self);

            // Determine the cumulative voting power of the user
            let cumulative_voting_power = Round::get_cumulative_governance_power(
                @Round::unsafe_new_contract_state(),
                self._config.read().start_timestamp,
                voter,
                StrategyType::VOTING,
                used_voting_strategies.span(),
            );
            assert(cumulative_voting_power.is_non_zero(), 'IR: User has no voting power');

            let mut proposal_votes = proposal_votes.span();
            loop {
                match proposal_votes.pop_front() {
                    Option::Some(proposal_vote) => _cast_votes_on_proposal(
                        ref self, voter, *proposal_vote, cumulative_voting_power
                    ),
                    Option::None(_) => {
                        break;
                    },
                };
            };
        }

        /// Process all new round winners by submitting their information to the consuming chain.
        fn process_winners(ref self: ContractState) {
            _assert_round_active(@self);
            _process_winners(ref self);
        }

        /// Cancel the round.
        fn cancel_round(ref self: ContractState) {
            // Round cancellations can only come from an origin chain round
            Round::assert_caller_is_deployer(@Round::unsafe_new_contract_state());
            _assert_round_active(@self);

            let mut config = self._config.read();
            config.round_state = RoundState::Cancelled(());
            self._config.write(config);
        }

        /// Finalize the round by processing remaining winners and changing the round state.
        fn finalize_round(ref self: ContractState) {
            // Round finalizations can only come from an origin chain round
            Round::assert_caller_is_deployer(@Round::unsafe_new_contract_state());
            _assert_round_active(@self);

            let winner_count = self._winner_count.read();

            // A round must have at least one winner to be finalized. Otherwise, the creator should cancel.
            assert(winner_count.is_non_zero(), 'IR: Finalization not available');

            // Process any unprocessed winners
            let processed_winner_count = self._processed_winner_count.read();
            if winner_count > processed_winner_count {
                _process_winners(ref self);
            }

            let execution_strategy_address = get_round_dependency_registry().get_dependency_at_key(
                Round::origin_chain_id(@Round::unsafe_new_contract_state()), RoundType::INFINITE, DependencyKey::EXECUTION_STRATEGY
            );
            if execution_strategy_address.is_non_zero() {
                let execution_strategy = IExecutionStrategyDispatcher {
                    contract_address: execution_strategy_address, 
                };
                execution_strategy.execute(_build_finalize_round_execution_params(winner_count));
            }

            let mut config = self._config.read();
            config.round_state = RoundState::Finalized(());
            self._config.write(config);

            self.emit(Event::RoundFinalized(RoundFinalized {}));
        }
    }

    /// Initialize the round.
    fn initializer(ref self: ContractState, round_params_: Span<felt252>) {
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

        self._config.write(
            RoundConfig {
                round_state: RoundState::Active(()),
                start_timestamp,
                vote_period,
                quorum_for,
                quorum_against,
                proposal_threshold,
            }
        );

        let mut round_state = Round::unsafe_new_contract_state();
        let mut strategy_groups = array![
            StrategyGroup {
                strategy_type: StrategyType::PROPOSING, strategies: proposing_strategies
            },
            StrategyGroup {
                strategy_type: StrategyType::VOTING, strategies: voting_strategies
            },
        ];
        Round::initializer(ref round_state, strategy_groups.span());
    }

    /// Decode the round parameters from an array of felt252s.
    /// * `params` - The array of felt252s.
    fn _decode_param_array(params: Span<felt252>) -> RoundParams {
        let start_timestamp = (*params.at(0)).try_into().unwrap();
        let vote_period = (*params.at(1)).try_into().unwrap();
        let quorum_for = *params.at(2);
        let quorum_against = *params.at(3);
        let proposal_threshold = *params.at(4);

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
    fn _assert_round_active(self: @ContractState) {
        assert(self._config.read().round_state == RoundState::Active(()), 'IR: Round not active');
    }

    /// Asserts that caller is a valid auth strategy and that the round is active.
    fn _assert_caller_valid_and_round_active(self: @ContractState) {
        Round::assert_caller_is_valid_auth_strategy(
            @Round::unsafe_new_contract_state(),
            RoundType::INFINITE,
        );
        _assert_round_active(self);
    }

    /// Asserts that `proposer` can modify `proposal`. This includes
    /// an assertion that the proposal exists, that `proposer` is the proposer,
    /// and that the proposal is active.
    fn _assert_can_modify_proposal(self: @ContractState, proposer: EthAddress, proposal: Proposal) {
        assert(proposal.proposer.is_non_zero(), 'IR: Proposal does not exist');
        assert(proposer == proposal.proposer, 'IR: Caller is not proposer');
        assert(
            _get_proposal_state(self, proposal) == ProposalState::Active(()), 'IR: Proposal is not active'
        );
    }

    /// Assert the validity of an asset request. This includes an assertion
    /// that the request size is valid and that there are no duplicate assets.
    /// * `requested_assets` - The requested assets.
    fn _assert_asset_request_valid(mut requested_assets: Span<Asset>) {
        assert(requested_assets.len() >= 1, 'IR: No assets requested');
        assert(requested_assets.len() < MAX_REQUESTED_ASSET_COUNT, 'IR: Too many assets requested');

        _assert_no_duplicate_assets(requested_assets);
    }

    /// Reverts if the asset array contains duplicate assets.
    /// * `assets` - The array of assets.
    fn _assert_no_duplicate_assets(mut assets: Span<Asset>) {
        let mut asset_ids = ArrayTrait::new();
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

    /// Cast votes on a single proposal.
    /// * `voter` - The address of the voter.
    /// * `proposal_vote` - The proposal vote information.
    /// * `cumulative_voting_power` - The cumulative voting power of the voter.
    fn _cast_votes_on_proposal(ref self: ContractState, voter: EthAddress, proposal_vote: ProposalVote, cumulative_voting_power: u256) {
        let proposal_id = proposal_vote.proposal_id;
        let proposal_version = proposal_vote.proposal_version;
        let voting_power = proposal_vote.voting_power;
        let direction = proposal_vote.direction;

        let mut proposal = self._proposals.read(proposal_id);
        assert(proposal.proposer.is_non_zero(), 'IR: Proposal does not exist');

        // Exit early if the proposal is not active
        if _get_proposal_state(@self, proposal) != ProposalState::Active(()) {
            return;
        }
        // Exit early if the proposal version has changed
        if proposal_version != proposal.version {
            return;
        }

        let spent_voting_power = self._spent_voting_power.read((voter, proposal_id, proposal_version));
        let remaining_voting_power = cumulative_voting_power - spent_voting_power;

        assert(voting_power.is_non_zero(), 'IR: No voting power provided');
        assert(remaining_voting_power >= voting_power, 'IR: Insufficient voting power');

        match direction {
            VoteDirection::Against(()) => {
                proposal.voting_power_against += voting_power;
            },
            VoteDirection::For(()) => {
                proposal.voting_power_for += voting_power;
            },
        };

        let config = self._config.read();
        if proposal.voting_power_for >= config.quorum_for.into() {
            _approve_proposal(ref self, proposal_id, ref proposal);
        } else if proposal.voting_power_against >= config.quorum_against.into() {
            _reject_proposal(ref self, proposal_id, ref proposal);
        }
        self._proposals.write(proposal_id, proposal);
        self._spent_voting_power.write((voter, proposal_id, proposal_version), spent_voting_power + voting_power);

        self.emit(Event::VoteCast(VoteCast { proposal_id, voter, voting_power, direction }));
    }

    /// Approve a proposal, setting its state to `Approved`, and appending the
    /// proposal's leaf to the incremental merkle tree.
    /// * `proposal_id` - The ID of the proposal to approve.
    /// * `proposal` - The proposal to approve.
    fn _approve_proposal(ref self: ContractState, proposal_id: u32, ref proposal: Proposal) {
        proposal.state = ProposalState::Approved(());

        let winner_count = self._winner_count.read();
        let mut imt = IncrementalMerkleTreeTrait::new(
            MAX_WINNER_TREE_DEPTH, winner_count, _read_sub_trees_from_storage(@self), 
        );
        let leaf = _compute_leaf(proposal_id, proposal);

        // The maximum winner count for this round is 2^10 (1024). `append_leaf` will revert
        // if the max count is reached.
        self._winner_merkle_root.write(imt.append_leaf(leaf));
        _write_sub_trees_to_storage(ref self, imt.get_current_depth(), ref imt.sub_trees);
        self._winner_count.write(winner_count + 1);

        self.emit(Event::ProposalApproved(ProposalApproved { proposal_id }));
    }

    /// Reject a proposal, setting its state to `Rejected`.
    /// * `proposal_id` - The ID of the proposal to reject.
    /// * `proposal` - The proposal to reject.
    fn _reject_proposal(ref self: ContractState, proposal_id: u32, ref proposal: Proposal) {
        proposal.state = ProposalState::Rejected(());
        self.emit(Event::ProposalRejected(ProposalRejected { proposal_id }));
    }

    /// Build the execution parameters necessary to process winners on an origin chain.
    /// * `winner_count` - The current winner count.
    /// * `merkle_root` - The merkle root that will be used for asset claims.
    fn _build_process_winners_execution_params(winner_count: u32, merkle_root: u256) -> Span<felt252> {
        let mut execution_params = array![
            winner_count.into(),
            merkle_root.low.into(),
            merkle_root.high.into(),
        ];
        execution_params.span()
    }

    /// Build the execution parameters necessary to finalize the round on an origin chain.
    /// * `winner_count` - The current winner count.
    fn _build_finalize_round_execution_params(winner_count: u32) -> Span<felt252> {
        let mut execution_params = array![
            winner_count.into()
        ];
        execution_params.span()
    }

    /// Compute a single leaf consisting of a proposal ID, proposer address, and requested asset hash.
    /// * `proposal_id` - The ID of the proposal to compute the leaf for.
    /// * `proposal` - The proposal to compute the leaf for.
    fn _compute_leaf(proposal_id: u32, proposal: Proposal) -> u256 {
        let mut leaf_input = array![
            u256_from_felt252(proposal_id.into()),
            u256_from_felt252(proposal.proposer.into()),
            u256_from_felt252(proposal.requested_assets_hash.into()),
        ];
        keccak_u256s_be(leaf_input.span())
    }

    /// Read existing incremental merkle tree sub trees from storage.
    fn _read_sub_trees_from_storage(self: @ContractState) -> Felt252Dict<Nullable<Span<u256>>> {
        let mut sub_trees = Default::default();

        let mut curr_depth = 0;
        loop {
            if curr_depth == MAX_WINNER_TREE_DEPTH {
                break;
            }
            let sub_tree = self._winner_merkle_sub_trees.read(curr_depth);
            if sub_tree.len().is_zero() {
                break;
            }
            sub_trees.insert(curr_depth.into(), nullable_from_box(BoxTrait::new(sub_tree)));
            curr_depth += 1;
        };
        sub_trees
    }

    /// Write the incremental merkle tree sub trees to storage.
    /// The user will not be charged storage costs for sub trees that are already in storage.
    /// * `max_depth` - The maximum depth of the sub trees to write to storage.
    /// * `sub_trees` - The sub trees to write to storage.
    fn _write_sub_trees_to_storage(ref self: ContractState, max_depth: u32, ref sub_trees: Felt252Dict<Nullable<Span<u256>>>) {
        let mut curr_depth = 0;
        loop {
            if curr_depth > max_depth {
                break;
            }
            match match_nullable(sub_trees.get(curr_depth.into())) {
                FromNullableResult::Null(()) => {
                    break;
                },
                FromNullableResult::NotNull(sub_tree) => {
                    self._winner_merkle_sub_trees.write(curr_depth, sub_tree.unbox());
                    curr_depth += 1;
                },
            };
        };
    }

    /// Process all new round winners by submitting their information to the consuming chain.
    /// This function will revert if there are no new winners to process.
    fn _process_winners(ref self: ContractState) {
        let winner_count = self._winner_count.read();
        assert(winner_count > 0 && winner_count > self._processed_winner_count.read(), 'IR: No new winners');

        // Update the processed winner count
        self._processed_winner_count.write(winner_count);

        let merkle_root = self._winner_merkle_root.read();
        let execution_strategy_address = get_round_dependency_registry().get_dependency_at_key(
            Round::origin_chain_id(@Round::unsafe_new_contract_state()), RoundType::INFINITE, DependencyKey::EXECUTION_STRATEGY
        );
        if execution_strategy_address.is_non_zero() {
            let execution_strategy = IExecutionStrategyDispatcher {
                contract_address: execution_strategy_address, 
            };
            execution_strategy.execute(_build_process_winners_execution_params(winner_count, merkle_root));
        }
        self.emit(Event::WinnersProcessed(WinnersProcessed { total_winner_count: winner_count, merkle_root }));
    }

    /// Get the state of the given proposal.
    /// * `proposal` - The proposal to get the state of.
    fn _get_proposal_state(self: @ContractState, proposal: Proposal) -> ProposalState {
        if proposal.state == ProposalState::Active(()) {
            // If the proposal is active, check if it has become stale.
            if get_block_timestamp() > proposal.received_at + self._config.read().vote_period {
                return ProposalState::Stale(());
            }
        }
        proposal.state
    }
}
