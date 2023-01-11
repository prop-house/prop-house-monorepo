import { ProposalFields } from './proposalFields';
import removeTags from './removeTags';

export const isValidPropData = (data: ProposalFields) =>
  data.title.length > 4 &&
  removeTags(data.what).length > 49 &&
  data.tldr.length > 9 &&
  data.tldr.length < 121;
