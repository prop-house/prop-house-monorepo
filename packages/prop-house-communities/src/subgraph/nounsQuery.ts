/**
 * Attempt to resolve a blocktag into a number, if the tag isn't a number return undefined.
 */
const parseBlockTag = (blockTag: number | string | "latest" | undefined): number | undefined => {
  if (typeof blockTag === "number" || typeof blockTag === "undefined") return blockTag;
  let blockNumber: number | undefined = undefined;
  const parsedBlockTag = blockTag.includes("0x") ? parseInt(blockTag, 16) : parseInt(blockTag, 10)
  if (!isNaN(parsedBlockTag)) blockNumber = parsedBlockTag;
  return blockNumber;
}

export const nounsDelegatedVotesToAddressQuery = (
  address: string,
  blockTag: number | string | "latest" | undefined
) => {
  const parsedBlockTag = parseBlockTag(blockTag)
  return `
  {
    delegates(
      ${parsedBlockTag ? `block: { number: ${parsedBlockTag} },` : ""}
      where: { id: "${address}" }
    ) {
      delegatedVotesRaw
    }
  }
`;
}

