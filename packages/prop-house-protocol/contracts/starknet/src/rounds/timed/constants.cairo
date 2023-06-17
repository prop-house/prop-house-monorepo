/// The maximum number of winners that can be specified for a round.
const MAX_WINNERS: u16 = 25;

/// Timed round EIP-712 type hashes used for authentication
mod TypeHash {
    /// The type hash for the proposal vote struct.
    /// keccak256("ProposalVote(uint32 proposalId,uint256 votingPower)")
    const PROPOSAL_VOTE: u256 = 0xa46ac0403a21fd8fb4a7df35c25609420514e278d87c90014f2065aeeb91dd11;

    /// The type hash for the propose function.
    /// keccak256("Propose(bytes32 authStrategy,bytes32 round,address proposerAddress,string metadataUri,UserStrategy[] usedProposingStrategies,uint256 salt)")
    const PROPOSE: u256 = 0x2bb3f5c5616c018654100c2b38e9cc3a492ab982a24ff3800b3f1fe4c0ef3bf7;

    /// The type hash for the edit proposal function.
    /// keccak256("EditProposal(bytes32 authStrategy,bytes32 round,address proposerAddress,uint32 proposalId,uint256 salt)")
    const EDIT_PROPOSAL: u256 = 0xa2900165f689887c96a3d1e1d5ce8efc347c9b7a0e2c4d8dcc266e87ad16f681;

    /// The type hash for the proposal cancellation function.
    /// keccak256("CancelProposal(bytes32 authStrategy,bytes32 round,address proposerAddress,uint32 proposalId,uint256 salt)")
    const CANCEL_PROPOSAL: u256 = 0xf5fc65045ee693ccd124134bc06612c6c9a61a783db8aced79886006d527e824;

    /// The type hash for the vote function.
    /// keccak256("Vote(bytes32 authStrategy,bytes32 round,address voterAddress,ProposalVote[] proposalVotes,UserStrategy[] usedVotingStrategies,uint256 salt)")
    const VOTE: u256 = 0xebc49fc678dd2135f6067241ffef763dd3404a8689eba1343f80c7fc90cf8da0;
}
