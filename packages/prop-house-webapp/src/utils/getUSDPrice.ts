import { AssetType } from '@prophouse/sdk-react';
import { Provider } from '@wagmi/core';

// Get USD price from CoinGecko API
export const getUSDPrice = async (type: AssetType, address: string, provider: Provider) => {
  // handle case when "Other" is selected but no address is provided yet
  if (type !== AssetType.ETH && address === '') return { price: 0 };

  try {
    const network = await provider.getNetwork();

    if (network.chainId === 5) {
      // TODO: not sure where to fetch price for Goerli addresses, CoinGecko doesn't support
      return { price: 1 };
    } else {
      const response = await fetch(
        type === AssetType.ETH
          ? `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
          : `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=usd`,
      );

      const data = await response.json();

      const price = type === AssetType.ETH ? data.ethereum.usd : data[address!.toLowerCase()].usd;

      return { price };
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching price info: ${error}`);
  }
};
