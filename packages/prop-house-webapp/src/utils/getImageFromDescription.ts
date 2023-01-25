import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';

const getImageFromDescription = (proposal: StoredProposalWithVotes) => {
  const what = proposal.what;
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = imgRegex.exec(what);
  if (match) {
    return match[1];
  } else {
    return '';
  }
};

export default getImageFromDescription;
