import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import isImage from 'is-image-url';

const getImageFromDescription = async (proposal: StoredProposalWithVotes) => {
  // proposal description field
  const what = proposal.what;

  // regex to find the first image in the description
  const imgRegex = /<img[^>]+src="([^">]+)"/;

  // find the first image in the description
  const match = imgRegex.exec(what);

  // check if there's an image in the description
  if (match) {
    try {
      // use is-image-url to check if the image is valid
      const isValid = await isImage(match[1]);
      if (isValid) {
        // return the image url
        return match[1];
      } else {
        return '';
      }
    } catch (err) {
      return '';
    }
  } else {
    return '';
  }
};

export default getImageFromDescription;
