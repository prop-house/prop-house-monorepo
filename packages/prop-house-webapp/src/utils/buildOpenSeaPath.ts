/**
 * This function takes an address and returns the URL of the OpenSea page for that address.
 * @param address The address to build the OpenSea path for
 * @param tokenId An optional token ID to build the OpenSea path for
 * @returns formatted OpenSea URL
 */
const buildOpenSeaPath = (address: string, tokenId?: string | number) => {
  if (tokenId === undefined) {
    return `https://opensea.io/assets/ethereum/${address}`;
  }
  return `https://opensea.io/assets/ethereum/${address}/${tokenId}`;
};

export default buildOpenSeaPath;
