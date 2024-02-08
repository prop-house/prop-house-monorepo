/// The maximum number of winners that can be specified for a round.
const MAX_WINNERS: u16 = 25;

/// Timed round function selectors
mod Selector {
    /// The selector of the propose function.
    const PROPOSE: felt252 = 0x1bfd596ae442867ef71ca523061610682af8b00fc2738329422f4ad8d220b81;

    /// The selector of the proposal cancellation function.
    const EDIT_PROPOSAL: felt252 = 0x2efd8e3286b26008e51db02bed9b28dc579fb1340a7457f27b990eb544a5216;

    /// The selector of the proposal cancellation function.
    const CANCEL_PROPOSAL: felt252 = 0xf58b7fa5874c036308bea0b54ae78e8ecf78d868aa18e666aa7fc4e0cbed6d;

    /// The selector of the vote function.
    const VOTE: felt252 = 0x132bdf85fc8aa10ac3c22f02317f8f53d4b4f52235ed1eabb3a4cbbe08b5c41;
}

/// Timed round EIP-712 type hashes used for authentication
mod TypeHash {
    /// The type hash for the proposal vote struct.
    /// keccak256("ProposalVote(uint32 proposalId,uint256 votingPower)")
    const PROPOSAL_VOTE: u256 = 0xa46ac0403a21fd8fb4a7df35c25609420514e278d87c90014f2065aeeb91dd11;

    /// The type hash for the propose function.
    /// keccak256("Propose(bytes32 authStrategy,bytes32 round,address proposer,uint256[] metadataUri,UserStrategy[] usedProposingStrategies,uint256 salt)UserStrategy(uint256 id,uint256[] userParams)")
    const PROPOSE: u256 = 0x96af737a59bf9e2c9aa272b216d504cb07fc233e8e886db7329ee917561c07a0;

    /// The type hash for the edit proposal function.
    /// keccak256("EditProposal(bytes32 authStrategy,bytes32 round,address proposer,uint32 proposalId,uint256[] metadataUri,uint256 salt)")
    const EDIT_PROPOSAL: u256 = 0x7943530c7e8e1d58a81194a9e511c60d84fb1af59b035602a742fbd15525c7d6;

    /// The type hash for the proposal cancellation function.
    /// keccak256("CancelProposal(bytes32 authStrategy,bytes32 round,address proposer,uint32 proposalId,uint256 salt)")
    const CANCEL_PROPOSAL: u256 = 0x028919d8d2d0420b53a157ead1cf69ce411b708959dae9a6acf31f6efee7ef14;

    /// The type hash for the vote function.
    /// keccak256("Vote(bytes32 authStrategy,bytes32 round,address voter,ProposalVote[] proposalVotes,UserStrategy[] usedVotingStrategies,uint256 salt)ProposalVote(uint32 proposalId,uint256 votingPower)UserStrategy(uint256 id,uint256[] userParams)")
    const VOTE: u256 = 0x6efb90c9f682be1f26749b1160b5bfa3305765946c617ece1e43d9db70cf8065;
}
