import { ProposalFields } from './proposalFields';
import inputHasImage from './inputHasImage';
import removeTags from './removeTags';

export const isValidPropData = (isInfRoundProp: boolean, data: ProposalFields) => {
  // todo: resolve for reqAmount
  const { title, tldr, what } = data;
  const baseReqs = title.length > 4 && tldr.length > 9 && tldr.length < 121;

  // don't req what input if  prop has image
  return inputHasImage(what) ? baseReqs : baseReqs && removeTags(what).length > 49;
};
