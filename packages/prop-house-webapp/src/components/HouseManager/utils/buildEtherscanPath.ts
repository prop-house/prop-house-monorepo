/**
 * This function builds the etherscan path for the given address
 * @param address The address to build the etherscan path for
 * @returns The etherscan path for the given address
 */
const buildEtherscanPath = (address: string) => `https://etherscan.io/address/${address}`;

export default buildEtherscanPath;
