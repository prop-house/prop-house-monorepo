#[starknet::contract]
mod EthereumBalanceOfERC721CheckpointableGovernancePowerStrategy {
    use starknet::ContractAddress;
    use prop_house::common::utils::constants::{MASK_96, TWO_POW_32};
    use prop_house::common::utils::traits::IGovernancePowerStrategy;
    use prop_house::common::libraries::single_slot_proof::SingleSlotProof;
    use prop_house::common::utils::storage::{get_slot_key, get_nested_slot_key};
    use array::{ArrayTrait, SpanTrait};
    use zeroable::Zeroable;
    use traits::Into;

    #[storage]
    struct Storage {}

    #[constructor]
    fn constructor(ref self: ContractState, fact_registry: ContractAddress, ethereum_block_registry: ContractAddress) {
        let mut ssp_state = SingleSlotProof::unsafe_new_contract_state();
        SingleSlotProof::initializer(ref ssp_state, fact_registry, ethereum_block_registry);
    }

    #[external(v0)]
    impl EthereumBalanceOfERC721CheckpointableGovernancePowerStrategy of IGovernancePowerStrategy<ContractState> {
        /// Returns the governance power of the user at the given timestamp.
        /// * `timestamp` - The timestamp at which to get the governance power.
        /// * `user` - The address of the user.
        /// * `params` - The params, containing the contract address and slot index.
        /// * `user_params` - The user params, containing the slot and MPT proof.
        fn get_power(
            self: @ContractState, timestamp: u64, user: felt252, params: Span<felt252>, user_params: Span<felt252>, 
        ) -> u256 {
            let params_len = params.len();

            // Expects contract_address, num_checkpoints_slot_index, and checkpoints_slot_index, with an optional governance_power_multiplier
            assert(params_len == 3 || params_len == 4, 'EthBO721C: Bad param length');

            let contract_address = *params.at(0);
            let num_checkpoints_slot_index = *params.at(1);
            let checkpoints_slot_index = *params.at(2);

            let num_checkpoints_slot = get_slot_key(num_checkpoints_slot_index.into(), user.into());
            let num_checkpoints = SingleSlotProof::get_slot_value(
                @SingleSlotProof::unsafe_new_contract_state(), timestamp, contract_address, num_checkpoints_slot, params, user_params
            );
            assert(num_checkpoints.is_non_zero(), 'EthBO721C: No checkpoints for user');

            let latest_checkpoint_slot = get_nested_slot_key(checkpoints_slot_index.into(), array![user.into(), num_checkpoints - 1]);
            let latest_checkpoint = SingleSlotProof::get_slot_value(
                @SingleSlotProof::unsafe_new_contract_state(), timestamp, contract_address, latest_checkpoint_slot, params, user_params
            );
            let governance_power = (latest_checkpoint / TWO_POW_32) & MASK_96;

            assert(governance_power.is_non_zero(), 'EthBO721C: No governance power');

            if params_len == 3 {
                return governance_power;
            }

            let governance_power_multiplier = *params.at(3);
            assert(governance_power_multiplier.is_non_zero(), 'EthBO721C: Invalid multiplier');

            governance_power * governance_power_multiplier.into()
        }
    }
}
