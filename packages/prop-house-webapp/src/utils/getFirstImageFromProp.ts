import { Proposal } from '@prophouse/sdk-react';
import isImage from 'is-image-url';

const getFirstImageFromProp = async (proposal: Proposal) => {
  // regex to find the first image in the description
  const imgRegex = /<img[^>]+src="([^">]+)"/;

  // find the first image in the description
  const match = imgRegex.exec(proposal.body);

  if (!match) return undefined;

  // check if there's an image in the description or it is a ph pinata upload
  return (await isImage(match[1])) || match[1].includes('prophouse.mypinata')
    ? match[1]
    : undefined;
};

export default getFirstImageFromProp;
