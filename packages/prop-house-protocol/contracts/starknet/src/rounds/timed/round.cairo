use prop_house::common::registry::strategy::Strategy;
use prop_house::common::libraries::round::Proposal;
use starknet::EthAddress;
use array::ArrayTrait;

trait ITimedRound {
    fn get_proposal(proposal_id: u32) -> Proposal;
    fn propose(
        proposer_address: EthAddress,
        metadata_uri: Array<felt252>,
        used_proposing_strategy_ids: Array<felt252>,
        user_proposing_strategy_params_flat: Array<felt252>,
    );
    fn edit_proposal(proposer_address: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>);
    fn cancel_proposal(proposer_address: EthAddress, proposal_id: u32);
    fn vote(
        voter_address: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategy_ids: Array<felt252>,
        user_voting_strategy_params_flat: Array<felt252>,
    );
    fn finalize_round(awards: Array<Award>);
}

mod RoundState {
    /// The round is active. It has not been cancelled or finalized.
    const ACTIVE: u8 = 0;
    /// The round has been cancelled. No more proposals or votes can be submitted. It cannot be finalized.
    const CANCELLED: u8 = 1;
    /// The round has been finalized. No more proposals or votes can be submitted.
    const FINALIZED: u8 = 2;
}

#[derive(Copy, Drop, Serde)]
enum StrategyType {
    Voting: (),
    Proposing: (),
}

struct RoundParams {
    award_hash: felt252,
    proposal_period_start_timestamp: u64,
    proposal_period_duration: u64,
    vote_period_duration: u64,
    winner_count: u16,
    proposal_threshold: felt252,
    proposing_strategies: Span<Strategy>,
    voting_strategies: Span<Strategy>,
}

#[derive(Copy, Drop, Serde)]
struct Award {
    asset_id: u256,
    amount: u256,
}

#[derive(Copy, Drop, Serde)]
struct ProposalVote {
    proposal_id: u32,
    voting_power: u256,
}

// TODO: Move these to registry that's indexed by chain ID
// Deployment-time constants
const strategy_registry_address: felt252 = 0xDEAD0001;
const eth_execution_strategy: felt252 = 0xDEAD0002;
const eth_tx_auth_strategy: felt252 = 0xDEAD0003;
const eth_sig_auth_strategy: felt252 = 0xDEAD0004;

#[contract]
mod TimedRound {
    use starknet::{
        ContractAddress, EthAddress, get_block_timestamp, get_caller_address,
        Felt252TryIntoContractAddress
    };
    use super::{
        ITimedRound, ProposalVote, StrategyType, RoundParams, RoundState, Award,
        strategy_registry_address, eth_execution_strategy, eth_tx_auth_strategy,
        eth_sig_auth_strategy
    };
    use prop_house::rounds::timed::config::RoundConfig;
    use prop_house::common::libraries::round::{Round, Proposal, ProposalWithId};
    use prop_house::common::registry::strategy::{
        IStrategyRegistryDispatcherTrait, IStrategyRegistryDispatcher, Strategy
    };
    use prop_house::common::utils::traits::{
        IGovernancePowerStrategyDispatcherTrait, IGovernancePowerStrategyDispatcher,
        IExecutionStrategyDispatcherTrait, IExecutionStrategyDispatcher
    };
    use prop_house::common::utils::array::{
        assert_no_duplicates, construct_2d_array, Immutable2DArray, get_sub_array, ArrayTraitExt,
        array_slice
    };
    use prop_house::common::utils::hash::{keccak_u256s_be, LegacyHashEthAddress};
    use prop_house::common::utils::constants::{MASK_192, MASK_250};
    use prop_house::common::utils::merkle::MerkleTreeTrait;
    use prop_house::common::utils::serde::SpanSerde;
    use integer::{u256_from_felt252, U16IntoFelt252, U32IntoFelt252};
    use array::{ArrayTrait, SpanTrait};
    use traits::{TryInto, Into};
    use option::OptionTrait;
    use zeroable::Zeroable;

    /// The maximum number of winners that can be specified for a round.
    const MAX_WINNERS: u16 = 255;

    struct Storage {
        _config: RoundConfig,
        _is_proposing_strategy_registered: LegacyMap<felt252, bool>,
        _is_voting_strategy_registered: LegacyMap<felt252, bool>,
        _spent_voting_power: LegacyMap<EthAddress, u256>,
    }

    #[event]
    fn ProposalCreated(
        proposal_id: u32, proposer_address: EthAddress, metadata_uri: Array<felt252>
    ) {}

    #[event]
    fn ProposalEdited(proposal_id: u32, updated_metadata_uri: Array<felt252>) {}

    #[event]
    fn ProposalCancelled(proposal_id: u32) {}

    #[event]
    fn VoteCast(proposal_id: u32, voter_address: EthAddress, voting_power: u256) {}

    #[event]
    fn RoundFinalized(winning_proposal_ids: Span<u32>, merkle_root: u256) {}

    impl TimedRound of ITimedRound {
        fn get_proposal(proposal_id: u32) -> Proposal {
            let proposal = Round::_proposals::read(proposal_id);
            assert(proposal.proposer.is_non_zero(), 'TR: Proposal does not exist');

            proposal
        }

        fn propose(
            proposer_address: EthAddress,
            metadata_uri: Array<felt252>,
            used_proposing_strategy_ids: Array<felt252>,
            user_proposing_strategy_params_flat: Array<felt252>,
        ) {
            // Verify that the caller is a valid auth strategy
            _assert_caller_is_valid_auth_strategy();

            // Verify that the funding round is active
            _assert_round_active();

            let config = _config::read();
            let current_timestamp = get_block_timestamp();

            // Ensure that the round is in the proposal period
            assert(
                current_timestamp >= config.proposal_period_start_timestamp,
                'TR: Proposal period not started',
            );
            assert(
                current_timestamp < config.proposal_period_end_timestamp,
                'TR: Proposal period has ended',
            );

            // Determine the cumulative proposition power of the user
            let cumulative_proposition_power = _get_cumulative_governance_power(
                config.proposal_period_start_timestamp,
                proposer_address,
                used_proposing_strategy_ids,
                user_proposing_strategy_params_flat.span(),
            );
            assert(
                cumulative_proposition_power >= config.proposal_threshold.into(),
                'TR: Proposition power too low'
            );

            let proposal_id = Round::_proposal_count::read() + 1;
            let proposal = Proposal {
                proposer: proposer_address,
                last_updated_at: current_timestamp,
                is_cancelled: false,
                voting_power: 0,
            };

            // Store the proposal and increment the proposal count
            Round::_proposals::write(proposal_id, proposal);
            Round::_proposal_count::write(proposal_id);

            ProposalCreated(proposal_id, proposer_address, metadata_uri);
        }

        fn edit_proposal(
            proposer_address: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>
        ) {
            // Verify that the caller is a valid auth strategy
            _assert_caller_is_valid_auth_strategy();

            // Verify that the funding round is active
            _assert_round_active();

            let mut proposal = Round::_proposals::read(proposal_id);

            // Ensure that the proposal exists
            assert(proposal.proposer.is_non_zero(), 'TR: Proposal does not exist');

            // Ensure that the proposal has not already been cancelled
            assert(!proposal.is_cancelled, 'TR: Proposal already cancelled');

            // Ensure that the caller is the proposer
            assert(proposer_address == proposal.proposer, 'TR: Caller is not proposer');

            // Set the last update timestamp
            proposal.last_updated_at = get_block_timestamp();
            Round::_proposals::write(proposal_id, proposal);

            ProposalEdited(proposal_id, metadata_uri);
        }

        fn cancel_proposal(proposer_address: EthAddress, proposal_id: u32) {
            // Verify that the caller is a valid auth strategy
            _assert_caller_is_valid_auth_strategy();

            // Verify that the funding round is active
            _assert_round_active();

            let mut proposal = Round::_proposals::read(proposal_id);

            // Ensure that the proposal exists
            assert(proposal.proposer.is_non_zero(), 'TR: Proposal does not exist');

            // Ensure that the proposal has not already been cancelled
            assert(!proposal.is_cancelled, 'TR: Proposal already cancelled');

            // Ensure that the caller is the proposer
            assert(proposer_address == proposal.proposer, 'TR: Caller is not proposer');

            // Cancel the proposal
            proposal.is_cancelled = true;
            Round::_proposals::write(proposal_id, proposal);

            ProposalCancelled(proposal_id);
        }

        fn vote(
            voter_address: EthAddress,
            proposal_votes: Array<ProposalVote>,
            used_voting_strategy_ids: Array<felt252>,
            user_voting_strategy_params_flat: Array<felt252>,
        ) {
            // Verify that the caller is a valid auth strategy
            _assert_caller_is_valid_auth_strategy();

            // Verify that the funding round is active
            _assert_round_active();

            let config = _config::read();
            let current_timestamp = get_block_timestamp();

            // The snapshot is taken at the proposal period end timestamp
            let snapshot_timestamp = config.proposal_period_end_timestamp;
            let vote_period_start_timestamp = snapshot_timestamp + 1;

            // Ensure that the round is in the voting period
            assert(current_timestamp >= vote_period_start_timestamp, 'TR: Vote period not begun');
            assert(
                current_timestamp <= config.vote_period_end_timestamp, 'TR: Vote period has ended'
            );

            // Determine the cumulative voting power of the user
            let cumulative_voting_power = _get_cumulative_governance_power(
                snapshot_timestamp,
                voter_address,
                used_voting_strategy_ids,
                user_voting_strategy_params_flat.span(),
            );
            assert(cumulative_voting_power.is_non_zero(), 'TR: User has no voting power');

            // Cast votes, throwing if the remaining voting power is insufficient
            _cast_votes_on_one_or_more_proposals(
                voter_address, cumulative_voting_power, proposal_votes.span()
            );
        }

        fn finalize_round(awards: Array<Award>) {
            // Verify that the funding round is active
            _assert_round_active();

            // Verify the validity of the provided awards
            _assert_awards_valid(awards.span());

            let config = _config::read();
            let current_timestamp = get_block_timestamp();

            assert(
                current_timestamp > config.vote_period_end_timestamp, 'TR: Vote period not ended'
            );

            let proposal_count = Round::_proposal_count::read();

            // If no proposals were submitted, the round must be cancelled.
            assert(proposal_count != 0, 'TR: No proposals submitted');

            let active_proposals = Round::get_active_proposals();
            let winning_proposals = Round::get_n_proposals_by_voting_power_desc(
                active_proposals, config.winner_count.into()
            );

            // TODO: Support arbitrary execution.

            // Compute the merkle root for the given leaves.
            let leaves = _compute_leaves(winning_proposals, awards);

            let mut merkle_tree = MerkleTreeTrait::<u256>::new();
            let merkle_root = merkle_tree.compute_merkle_root(leaves);
            let execution_strategy = IExecutionStrategyDispatcher {
                contract_address: eth_execution_strategy.try_into().unwrap(), 
            };
            execution_strategy.execute(_build_execution_params(merkle_root));

            let mut config = _config::read();

            config.round_state = RoundState::FINALIZED;
            _config::write(config);

            RoundFinalized(Round::extract_proposal_ids(winning_proposals), merkle_root);
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
    /// * `proposer_address` - The address of the proposer.
    /// * `metadata_uri` - The proposal metadata URI.
    /// * `used_proposing_strategy_ids` - The IDs of the strategies used to propose.
    /// * `user_proposing_strategy_params_flat` - The flattened parameters for the strategies used to propose.
    #[external]
    fn propose(
        proposer_address: EthAddress,
        metadata_uri: Array<felt252>,
        used_proposing_strategy_ids: Array<felt252>,
        user_proposing_strategy_params_flat: Array<felt252>,
    ) {
        TimedRound::propose(
            proposer_address,
            metadata_uri,
            used_proposing_strategy_ids,
            user_proposing_strategy_params_flat,
        );
    }

    /// Edit a proposal.
    /// * `proposer_address` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal to cancel.
    /// * `metadata_uri` - The updated proposal metadata URI.
    #[external]
    fn edit_proposal(proposer_address: EthAddress, proposal_id: u32, metadata_uri: Array<felt252>) {
        TimedRound::edit_proposal(proposer_address, proposal_id, metadata_uri);
    }

    /// Cancel a proposal.
    /// * `proposer_address` - The address of the proposer.
    /// * `proposal_id` - The ID of the proposal to cancel.
    #[external]
    fn cancel_proposal(proposer_address: EthAddress, proposal_id: u32) {
        TimedRound::cancel_proposal(proposer_address, proposal_id);
    }

    /// Cast votes on one or more proposals.
    /// * `voter_address` - The address of the voter.
    /// * `proposal_votes` - The votes to cast.
    /// * `used_voting_strategy_ids` - The IDs of the voting strategies used to cast the votes.
    /// * `user_voting_strategy_params_flat` - The flattened parameters for the voting strategies used to cast the votes.
    #[external]
    fn vote(
        voter_address: EthAddress,
        proposal_votes: Array<ProposalVote>,
        used_voting_strategy_ids: Array<felt252>,
        user_voting_strategy_params_flat: Array<felt252>,
    ) {
        TimedRound::vote(
            voter_address,
            proposal_votes,
            used_voting_strategy_ids,
            user_voting_strategy_params_flat,
        );
    }

    /// Finalize the round by determining winners and relaying execution.
    /// * `awards` - The awards to distribute.
    #[external]
    fn finalize_round(awards: Array<Award>) {
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

        assert(award_hash != 0, 'TR: Invalid award hash');
        assert(proposal_period_start_timestamp != 0, 'TR: Invalid PPST');
        assert(proposal_period_duration != 0, 'TR: Invalid PPD');
        assert(vote_period_duration != 0, 'TR: Invalid VPD');
        assert(winner_count != 0 & winner_count <= MAX_WINNERS, 'TR: Invalid winner count');
        assert(voting_strategies.len() != 0, 'TR: No voting strategies');

        let proposal_period_end_timestamp = proposal_period_start_timestamp + proposal_period_duration;
        let vote_period_end_timestamp = proposal_period_end_timestamp + vote_period_duration;

        _config::write(
            RoundConfig {
                round_state: RoundState::ACTIVE,
                winner_count,
                proposal_period_start_timestamp,
                proposal_period_end_timestamp,
                vote_period_end_timestamp,
                proposal_threshold,
                award_hash,
            }
        );
        _register_strategies(StrategyType::Proposing(()), proposing_strategies);
        _register_strategies(StrategyType::Voting(()), voting_strategies);
    }

    /// Parse strategies from a flattened array of parameters.
    /// * `params` - The flattened array of parameters.
    /// * `starting_index` - The index of the first parameter to parse.
    fn _parse_strategies(
        params: Span<felt252>, mut starting_index: usize
    ) -> (Span<Strategy>, usize) {
        let strategy_addresses_len = (*params.at(starting_index)).try_into().unwrap();

        let strategy_addresses = array_slice(params, starting_index + 1, strategy_addresses_len);
        let strategy_params_flat_len = (*params.at(starting_index + 1 + strategy_addresses_len)).try_into().unwrap();

        let strategy_params_flat = array_slice(
            params, starting_index + 2 + strategy_addresses_len, strategy_params_flat_len
        );
        let array_2d = construct_2d_array(strategy_params_flat.span());

        let mut i = 0;
        let mut strategies = Default::<Array<Strategy>>::default();
        loop {
            if i == strategy_addresses_len {
                break (
                    strategies.span(),
                    starting_index + 2 + strategy_addresses_len + strategy_params_flat_len
                );
            }
            let address = (*strategy_addresses.at(i)).try_into().unwrap();
            let params = get_sub_array(@array_2d, i);

            strategies.append(Strategy { address, params: params.span() });
            i += 1;
        }
    }

    /// Decode the round parameters from an array of felt252s.
    /// * `params` - The array of felt252s.
    fn _decode_param_array(params: Span<felt252>) -> RoundParams {
        let award_hash = *params.at(0).into();
        let proposal_period_start_timestamp = (*params.at(1)).try_into().unwrap();
        let proposal_period_duration = (*params.at(2)).try_into().unwrap();
        let vote_period_duration = (*params.at(3)).try_into().unwrap();
        let winner_count = (*params.at(4)).try_into().unwrap();
        let proposal_threshold = *params.at(5);

        let (proposing_strategies, offset) = _parse_strategies(params, 6);
        let (voting_strategies, _) = _parse_strategies(params, offset);

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

    /// Asserts that the caller is a valid auth strategy.
    fn _assert_caller_is_valid_auth_strategy() {
        let caller: felt252 = get_caller_address().into();
        assert(
            caller == eth_tx_auth_strategy | caller == eth_sig_auth_strategy,
            'TR: Invalid auth strategy'
        );
    }

    /// Asserts that the round is active.
    fn _assert_round_active() {
        assert(_config::read().round_state == RoundState::ACTIVE, 'TR: Round not active');
    }

    /// Asserts that the provided awards are valid.
    fn _assert_awards_valid(awards: Span<Award>) {
        let flattened_awards = _flatten_and_abi_encode_awards(awards);
        let stored_award_hash = _config::read().award_hash.into();
        let computed_award_hash = keccak_u256s_be(flattened_awards) & MASK_250;

        assert(computed_award_hash == stored_award_hash, 'TR: Invalid awards provided');
    }

    /// Register the provided strategies if they are not already registered.
    /// * `strategy_type` - The type of strategy to register.
    /// * `strategies` - The strategies to register.
    fn _register_strategies(strategy_type: StrategyType, mut strategies: Span<Strategy>) {
        let strategy_registry = IStrategyRegistryDispatcher {
            contract_address: strategy_registry_address.try_into().unwrap(), 
        };
        loop {
            match strategies.pop_front() {
                Option::Some(s) => {
                    let strategy_id = strategy_registry.register_strategy_if_not_exists(*s);
                    match strategy_type {
                        StrategyType::Voting(()) => _is_voting_strategy_registered::write(
                            strategy_id, true
                        ),
                        StrategyType::Proposing(()) => _is_proposing_strategy_registered::write(
                            strategy_id, true
                        ),
                    }
                },
                Option::None(_) => {
                    break;
                },
            };
        };
    }

    /// Returns the cumulative governance power of the given user for the provided strategies.
    /// * `timestamp` - The timestamp at which to calculate the cumulative governance power.
    /// * `user_address` - The address of the user.
    /// * `used_strategy_ids` - The IDs of the strategies used to calculate the cumulative governance power.
    /// * `user_strategy_params_all` - The strategy parameters for all governance power strategies.
    fn _get_cumulative_governance_power(
        timestamp: u64,
        user_address: EthAddress,
        mut used_strategy_ids: Array<felt252>,
        user_strategy_params_all: Span<felt252>,
    ) -> u256 {
        // Ensure there are no duplicates to prevent double counting
        assert_no_duplicates(ref used_strategy_ids);

        let strategy_registry = IStrategyRegistryDispatcher {
            contract_address: strategy_registry_address.try_into().unwrap(), 
        };
        let user_strategy_params = construct_2d_array(user_strategy_params_all);

        let mut i = 0;
        let mut cumulative_power = 0;
        loop {
            match used_strategy_ids.pop_front() {
                Option::Some(strategy_id) => {
                    let strategy = strategy_registry.get_strategy(strategy_id);
                    let governance_power_strategy = IGovernancePowerStrategyDispatcher {
                        contract_address: strategy.address
                    };
                    let power = governance_power_strategy.get_power(
                        timestamp,
                        user_address.into(),
                        strategy.params,
                        get_sub_array(@user_strategy_params, i).span(),
                    );

                    i += 1;
                    cumulative_power += power;
                },
                Option::None(_) => {
                    break cumulative_power;
                },
            };
        }
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
        let mut spent_voting_power = _spent_voting_power::read(voter_address);
        let mut remaining_voting_power = cumulative_voting_power - spent_voting_power;
        loop {
            match proposal_votes.pop_front() {
                Option::Some(proposal_vote) => {
                    // Cast the votes for the proposal
                    spent_voting_power += _cast_votes_on_proposal(
                        voter_address, *proposal_vote, remaining_voting_power, 
                    );
                    remaining_voting_power -= spent_voting_power;
                },
                Option::None(_) => {
                    // Update the spent voting power for the user
                    _spent_voting_power::write(voter_address, spent_voting_power);
                    break;
                },
            };
        };
    }

    /// Cast votes on a single proposal.
    /// * `voter_address` - The address of the voter.
    /// * `proposal_vote` - The proposal vote information.
    /// * `remaining_voting_power` - The remaining voting power of the voter.
    fn _cast_votes_on_proposal(
        voter_address: EthAddress, proposal_vote: ProposalVote, remaining_voting_power: u256, 
    ) -> u256 {
        let proposal_id = proposal_vote.proposal_id;
        let voting_power = proposal_vote.voting_power;

        let mut proposal = Round::_proposals::read(proposal_id);
        assert(proposal.proposer.is_non_zero(), 'TR: Proposal does not exist');

        // Exit early if the proposal has been cancelled
        if proposal.is_cancelled {
            return 0;
        }

        assert(voting_power.is_non_zero(), 'TR: No voting power provided');
        assert(remaining_voting_power >= voting_power, 'TR: Insufficient voting power');

        let new_proposal_voting_power = proposal.voting_power + voting_power;
        proposal.voting_power = new_proposal_voting_power;
        Round::_proposals::write(proposal_id, proposal);

        VoteCast(proposal_id, voter_address, voting_power);

        voting_power
    }

    // Flatten and ABI-encode (adds data offset + array length prefix) an array of award assets.
    /// * `awards` - The array of awards to flatten and encode.
    fn _flatten_and_abi_encode_awards(mut awards: Span<Award>) -> Span<u256> {
        let award_count = awards.len();
        let award_count_felt: felt252 = award_count.into();

        let mut flattened_awards = Default::default();
        flattened_awards.append(0x20.into()); // Data offset
        flattened_awards.append(award_count_felt.into()); // Array length

        loop {
            match awards.pop_front() {
                Option::Some(a) => {
                    flattened_awards.append(*a.asset_id);
                    flattened_awards.append(*a.amount);
                },
                Option::None(_) => {
                    break flattened_awards.span();
                },
            };
        }
    }

    /// Build the execution parameters that will be passed to the execution strategy.
    /// * `merkle_root` - The merkle root that will be used for asset claims.
    fn _build_execution_params(merkle_root: u256) -> Span<felt252> {
        let mut execution_params = Default::default();
        execution_params.append(merkle_root.low.into());
        execution_params.append(merkle_root.high.into());

        execution_params.span()
    }

    /// Compute the leaves for the given proposals and awards.
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `awards` - The awards to compute the leaves for.
    fn _compute_leaves(proposals: Span<ProposalWithId>, awards: Array<Award>) -> Span<u256> {
        if awards.len() == 1 {
            return _compute_leaves_for_split_award(proposals, *awards.at(0));
        }
        _compute_leaves_for_assigned_awards(proposals, awards)
    }

    /// Compute the leaves for the given proposals using an award that is to be split
    /// evenly among the them.
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `award_to_split` - The award to split evenly among the proposals.
    /// TODO: Support instant reclamation of remaining assets when the submitted
    /// proposal count is less than the defined number of winners.
    fn _compute_leaves_for_split_award(
        proposals: Span<ProposalWithId>, award_to_split: Award
    ) -> Span<u256> {
        let proposal_len: felt252 = proposals.len().into();
        let amount_per_proposal = award_to_split.amount / proposal_len.into();

        let mut leaves = Default::<Array<u256>>::default();
        let proposal_count = proposals.len();

        let mut i = 0;
        loop {
            if i == proposal_count {
                break leaves.span();
            }
            leaves.append(
                _compute_leaf_for_proposal_award(
                    *proposals.at(i), award_to_split.asset_id, amount_per_proposal
                )
            );
            i += 1;
        }
    }

    /// Compute the leaves for the given proposals using awards that are to be assigned
    /// to each proposal individually.
    /// * `proposals` - The proposals to compute the leaves for.
    /// * `awards` - The awards to assign to each proposal.
    /// TODO: Support instant reclamation of remainder assets when the submitted
    /// proposal count is less than the defined number of winners.
    fn _compute_leaves_for_assigned_awards(
        proposals: Span<ProposalWithId>, awards: Array<Award>
    ) -> Span<u256> {
        let proposal_count = proposals.len();
        let mut leaves = Default::<Array<u256>>::default();

        let mut i = 0;
        loop {
            if i == proposal_count {
                break leaves.span();
            }
            let award = *awards.at(i);

            leaves.append(
                _compute_leaf_for_proposal_award(*proposals.at(i), award.asset_id, award.amount)
            );
            i += 1;
        }
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
        leaf_input.append(asset_id);
        leaf_input.append(asset_amount);

        keccak_u256s_be(leaf_input.span())
    }
}
