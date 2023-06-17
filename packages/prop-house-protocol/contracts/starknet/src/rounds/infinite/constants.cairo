/// The maximum depth of the winner merkle tree.
const MAX_WINNER_TREE_DEPTH: u32 = 10;

/// The maximum number of assets that can be requested in a single proposal.
const MAX_REQUESTED_ASSET_COUNT: u32 = 10;

/// Infinite round EIP-712 type hashes used for authentication
mod TypeHash {
    /// The type hash for the proposal vote struct.
    /// keccak256("ProposalVote(uint32 proposalId, uint16 proposalVersion,uint256 votingPower,uint8 direction)")
    const PROPOSAL_VOTE: u256 = 0x204f42f4b1c7ce0b74c4c3721e8f2787c034d63da40a4c68ddf003bd8b12efda;

    /// The type hash for the propose function.
    /// keccak256("Propose(bytes32 authStrategy,bytes32 round,address proposerAddress,string metadataUri,Asset[] requestedAssets,UserStrategy[] usedProposingStrategies,uint256 salt)")
    const PROPOSE: u256 = 0x1953db79432c4a2a34989bcb81841192a33652343c18949c3b83d58f40d511d0;

    /// The type hash for the edit proposal function.
    /// keccak256("EditProposal(bytes32 authStrategy,bytes32 round,address proposerAddress,uint32 proposalId,string metadataUri,Asset[] requestedAssets,uint256 salt)")
    const EDIT_PROPOSAL: u256 = 0x0bb96d773096a629ff042f725fdd7b6fe5e2986afb5b4b0e9513e191053c4ef9;

    /// The type hash for the proposal cancellation function.
    /// keccak256("CancelProposal(bytes32 authStrategy,bytes32 round,address proposerAddress,uint32 proposalId,uint256 salt)")
    const CANCEL_PROPOSAL: u256 = 0xf5fc65045ee693ccd124134bc06612c6c9a61a783db8aced79886006d527e824;

    /// The type hash for the vote function.
    /// keccak256("Vote(bytes32 authStrategy,bytes32 round,address voterAddress,ProposalVote[] proposalVotes,UserStrategy[] usedVotingStrategies,uint256 salt)")
    const VOTE: u256 = 0xebc49fc678dd2135f6067241ffef763dd3404a8689eba1343f80c7fc90cf8da0;
}
