import { Proposal } from '@prophouse/sdk-react';
import isImage from 'is-image-url';

const getFirstImageFromProp = async (proposal: Proposal) => {
  // proposal description field
  const proposalDescription = proposal.body;

  // regex to find the first image in the description
  const imgRegex = /<img[^>]+src="([^">]+)"/;

  // find the first image in the description
  const match = imgRegex.exec(proposalDescription);

  if (!match) return undefined;

  // check if there's an image in the description or it is a ph pinata upload
  return (await isImage(match[1])) || match[1].includes('ipfs') ? match[1] : undefined;
};

export default getFirstImageFromProp;
