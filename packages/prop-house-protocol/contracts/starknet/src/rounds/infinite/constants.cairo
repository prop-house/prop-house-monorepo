/// The maximum depth of the winner merkle tree.
const MAX_WINNER_TREE_DEPTH: u32 = 10;

/// The maximum number of assets that can be requested in a single proposal.
const MAX_REQUESTED_ASSET_COUNT: u32 = 10;

/// Infinite round function selectors
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

/// Infinite round EIP-712 type hashes used for authentication
mod TypeHash {
    /// The type hash for the proposal vote struct.
    /// keccak256("ProposalVote(uint32 proposalId, uint16 proposalVersion,uint256 votingPower,uint8 direction)")
    const PROPOSAL_VOTE: u256 = 0x204f42f4b1c7ce0b74c4c3721e8f2787c034d63da40a4c68ddf003bd8b12efda;

    /// The type hash for the propose function.
    /// keccak256("Propose(bytes32 authStrategy,bytes32 round,address proposer,string metadataUri,Asset[] requestedAssets,UserStrategy[] usedProposingStrategies,uint256 salt)")
    const PROPOSE: u256 = 0xdaafb6cc440106b3cc0ecc748c18bfed7d9e32b203fdaba20a581476131b8366;

    /// The type hash for the edit proposal function.
    /// keccak256("EditProposal(bytes32 authStrategy,bytes32 round,address proposer,uint32 proposalId,string metadataUri,Asset[] requestedAssets,uint256 salt)")
    const EDIT_PROPOSAL: u256 = 0x38350717ff2d084274290880b847e9de1c1c410985eefc65f6a4266ba16d02b2;

    /// The type hash for the proposal cancellation function.
    /// keccak256("CancelProposal(bytes32 authStrategy,bytes32 round,address proposer,uint32 proposalId,uint256 salt)")
    const CANCEL_PROPOSAL: u256 = 0x028919d8d2d0420b53a157ead1cf69ce411b708959dae9a6acf31f6efee7ef14;

    /// The type hash for the vote function.
    /// keccak256("Vote(bytes32 authStrategy,bytes32 round,address voter,ProposalVote[] proposalVotes,UserStrategy[] usedVotingStrategies,uint256 salt)")
    const VOTE: u256 = 0x4ffe05782f7a786a66654c624e3e1bef5b322bbe86b6c7ee8cd61ed9f946a6f7;
}
