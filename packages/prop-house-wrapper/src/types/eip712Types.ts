import { TypedDataField } from '@ethersproject/abstract-signer';

export const DomainSeparator = {
  name: 'Prop House',
};

export const VoteMessageTypes: Record<string, TypedDataField[]> = {
  Votes: [{ name: 'votes', type: 'Vote[]' }],
  Vote: [
    { name: 'direction', type: 'uint256' },
    { name: 'proposalId', type: 'uint256' },
    { name: 'weight', type: 'uint256' },
    { name: 'communityAddress', type: 'address' },
    { name: 'blockHeight', type: 'uint256' },
  ],
};

export const TimedAuctionProposalMessageTypes: Record<string, TypedDataField[]> = {
  Proposal: [
    { name: 'title', type: 'string' },
    { name: 'tldr', type: 'string' },
    { name: 'what', type: 'string' },
    { name: 'parentAuctionId', type: 'uint256' },
  ],
};

export const InfiniteAuctionProposalMessageTypes: Record<string, TypedDataField[]> = {
  Proposal: [
    { name: 'title', type: 'string' },
    { name: 'tldr', type: 'string' },
    { name: 'what', type: 'string' },
    { name: 'parentAuctionId', type: 'uint256' },
    { name: 'reqAmount', type: 'uint256' },
  ],
};

export const EditProposalMessageTypes: Record<string, TypedDataField[]> = {
  Proposal: [
    { name: 'id', type: 'uint256' },
    { name: 'title', type: 'string' },
    { name: 'tldr', type: 'string' },
    { name: 'what', type: 'string' },
    { name: 'parentAuctionId', type: 'uint256' },
  ],
};

export const DeleteProposalMessageTypes: Record<string, TypedDataField[]> = {
  Proposal: [{ name: 'id', type: 'uint256' }],
};
