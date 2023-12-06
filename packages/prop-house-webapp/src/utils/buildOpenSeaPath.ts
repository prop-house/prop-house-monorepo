/**
 * This function takes an address and returns the URL of the OpenSea page for that address.
 * @param address The address to build the OpenSea path for
 * @returns formatted OpenSea URL
 */
const buildOpenSeaPath = (address: string) => `https://opensea.io/assets/ethereum/${address}`;

export default buildOpenSeaPath;
