import { ProposalFields } from './proposalFields';
import inputHasImage from './inputHasImage';
import removeTags from './removeTags';

export const isValidPropData = (isInfRound: boolean, data: ProposalFields) => {
  const { title, tldr, what, reqAmount } = data;
  const baseReqs =
    title.length > 4 && tldr.length > 9 && tldr.length < 121 && isInfRound && reqAmount !== null;

  // don't req what input if  prop has image
  return inputHasImage(what) ? baseReqs : baseReqs && removeTags(what).length > 49;
};
