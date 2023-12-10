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
    /// keccak256("ProposalVote(uint32 proposalId,uint16 proposalVersion,uint256 votingPower,uint8 direction)")
    const PROPOSAL_VOTE: u256 = 0x48d97eb99538f7ce7ccb6355565d4f5088861e1423d5fc23eb3fb8aa4b5a2621;

    /// The type hash for the propose function.
    /// keccak256("Propose(bytes32 authStrategy,bytes32 round,address proposer,uint256[] metadataUri,Asset[] requestedAssets,UserStrategy[] usedProposingStrategies,uint256 salt)Asset(uint256 assetId,uint256 amount)UserStrategy(uint256 id,uint256[] userParams)")
    const PROPOSE: u256 = 0x2ca56ea827f1e0732a9a0815ec6abf87ebac440073e2f7c1a52ba958104a11ee;

    /// The type hash for the edit proposal function.
    /// keccak256("EditProposal(bytes32 authStrategy,bytes32 round,address proposer,uint32 proposalId,uint256[] metadataUri,Asset[] requestedAssets,uint256 salt)Asset(uint256 assetId,uint256 amount)")
    const EDIT_PROPOSAL: u256 = 0xf26ffed9e8e09475cec81abdcdbb59bb4c2c3c6b834827871e2f21d3873e2842;

    /// The type hash for the proposal cancellation function.
    /// keccak256("CancelProposal(bytes32 authStrategy,bytes32 round,address proposer,uint32 proposalId,uint256 salt)")
    const CANCEL_PROPOSAL: u256 = 0x028919d8d2d0420b53a157ead1cf69ce411b708959dae9a6acf31f6efee7ef14;

    /// The type hash for the vote function.
    /// keccak256("Vote(bytes32 authStrategy,bytes32 round,address voter,ProposalVote[] proposalVotes,UserStrategy[] usedVotingStrategies,uint256 salt)ProposalVote(uint32 proposalId,uint16 proposalVersion,uint256 votingPower,uint8 direction)UserStrategy(uint256 id,uint256[] userParams)")
    const VOTE: u256 = 0xaf9bdd3c67fb570ce935aee4a81bb75405c9a21889fa88c72c36d13f3e19cb91;
}
