export const EIP712Domain = {
  name: 'Prop House',
};

export const EIP712MessageTypes = {
  Votes: [{ name: 'votes', type: 'Vote[]' }],
  Vote: [
    { name: 'direction', type: 'uint256' },
    { name: 'proposalId', type: 'uint256' },
    { name: 'weight', type: 'uint256' },
    { name: 'communityAddress', type: 'address' },
    { name: 'blockHeight', type: 'uint256' },
  ],
};
