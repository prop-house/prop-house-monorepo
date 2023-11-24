import { Provider } from '@wagmi/core';

// Get contract Name and Image from OpenSea API
export const getTokenInfo = async (contractAddress: string, provider: Provider) => {
  try {
    const network = await provider.getNetwork();
    let baseURL;

    // Mainnet
    if (network.chainId === 1) {
      baseURL = 'https://api.opensea.io/api/v1';
    }
    // Goerli
    else if (network.chainId === 5) {
      baseURL = 'https://testnets-api.opensea.io/api/v1';
    } else {
      throw new Error(`Unsupported chain ID: ${network.chainId}`);
    }

    const response = await fetch(`${baseURL}/asset_contract/${contractAddress}`);

    const data = await response.json();

    const { name, image_url, symbol, collection } = data;

    return {
      name: name ? name || collection.name : 'Unknown',
      image: image_url ? image_url : '/manager/fallback.png',
      symbol: symbol ? symbol : 'N/A',
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching contract info: ${error}`);
  }
};
