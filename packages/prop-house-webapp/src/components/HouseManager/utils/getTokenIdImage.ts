import { Provider } from '@wagmi/core';

// Get contract Name and Image from OpenSea API
export const getTokenIdImage = async (address: string, tokenId: string, provider: Provider) => {
  try {
    const network = await provider.getNetwork();
    let baseURL;

    // Mainnet
    if (network.chainId === 1) {
      baseURL = 'https://api.opensea.io/api/v1/asset';
    }
    // Goerli
    else if (network.chainId === 5) {
      baseURL = 'https://testnets-api.opensea.io/api/v1/asset';
    } else {
      throw new Error(`Unsupported chain ID: ${network.chainId}`);
    }
    const response = await fetch(`${baseURL}/${address}/${tokenId}`);

    if (!response.ok) {
      throw new Error(`Error fetching contract info: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const { image_url } = data;

    return { image: image_url || '/manager/fallback.png' };
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching contract info: ${error}`);
  }
};
