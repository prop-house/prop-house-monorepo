/**
 * Attempt to resolve a blocktag into a number, if the tag isn't a number return undefined.
 */
export const parseBlockTag = (
  blockTag: number | string | 'latest' | undefined,
): number | undefined => {
  if (typeof blockTag === 'number' || typeof blockTag === 'undefined') return blockTag;
  let blockNumber: number | undefined = undefined;
  const parsedBlockTag = blockTag.includes('0x') ? parseInt(blockTag, 16) : parseInt(blockTag, 10);
  if (!isNaN(parsedBlockTag)) blockNumber = parsedBlockTag;
  return blockNumber;
};
