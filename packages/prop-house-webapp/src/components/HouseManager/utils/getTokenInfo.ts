// Get contract Name and Image from OpenSea API
export const getTokenInfo = async (contractAddress: string) => {
  try {
    const response = await fetch(`https://api.opensea.io/api/v1/asset_contract/${contractAddress}`);
    if (!response.ok) {
      throw new Error(`Error fetching contract info: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const { name, image_url, symbol } = data;
    // TODO: DAI doesn't have symbol, could use coingecko API to get symbol
    // https://api.coingecko.com/api/v3/coins/ethereum/contract/0x6b175474e89094c44da98b954eedeac495271d0f/
    // 2) Can't find ETH symbol, could use coingecko API to get symbol
    return { name, image: image_url, symbol };
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching contract info: ${error}`);
  }
};
