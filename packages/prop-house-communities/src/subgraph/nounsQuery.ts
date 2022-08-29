import { parseBlockTag } from '../utils/parseBlockTag';

export const nounsDelegatedVotesToAddressQuery = (
  address: string,
  blockTag: number | string | 'latest' | undefined,
) => {
  const parsedBlockTag = parseBlockTag(blockTag);
  return `
  {
    delegates(
      ${parsedBlockTag ? `block: { number: ${parsedBlockTag} },` : ''}
      where: { id: "${address}" }
    ) {
      delegatedVotesRaw
    }
  }
`;
};
