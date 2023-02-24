import { ProposalFields } from './proposalFields';
import inputHasImage from './inputHasImage';
import removeTags from './removeTags';

export const isValidPropData = (data: ProposalFields, ignoreDescription = false) => {
  const { title, tldr, what } = data;
  if (inputHasImage(what)) {
    return title.length > 4 && tldr.length > 9 && tldr.length < 121;
  } else {
    return title.length > 4 && removeTags(what).length > 49 && tldr.length > 9 && tldr.length < 121;
  }
};
