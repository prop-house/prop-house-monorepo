use starknet::ContractAddress;

#[abi]
trait IExecutionStrategy {
    fn execute(params: Array<felt252>);
}

#[abi]
trait IVotingStrategy {
    fn get_voting_power(
        timestamp: u64, voter_address: felt252, params: Array<felt252>, user_params: Array<felt252>, 
    ) -> u256;
}

#[abi]
trait IAuthStrategy {
    fn authenticate(target: ContractAddress, selector: felt252, cdata: Array<felt252>);
}
