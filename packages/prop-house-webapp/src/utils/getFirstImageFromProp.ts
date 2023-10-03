import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import isImage from 'is-image-url';

const getFirstImageFromProp = async (proposal: StoredProposalWithVotes) => {
  // proposal description field
  const proposalDescription = proposal.what;

  // regex to find the first image in the description
  const imgRegex = /<img[^>]+src="([^">]+)"/;

  // find the first image in the description
  const match = imgRegex.exec(proposalDescription);

  if (!match) return undefined;

  // check if there's an image in the description or it is a ph pinata upload
  return (await isImage(match[1])) || match[1].includes('ipfs') ? match[1] : undefined;
};

export default getFirstImageFromProp;
