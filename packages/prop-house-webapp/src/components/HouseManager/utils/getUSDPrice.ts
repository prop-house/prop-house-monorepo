import { AssetType } from '@prophouse/sdk-react';

export const getUSDPrice = async (type: AssetType, address: string, amount: number) => {
  // handle case when "Other" is selected but no address is provided yet
  if (type !== AssetType.ETH && address === '') return { price: 0 };

  try {
    const response = await fetch(
      type === AssetType.ETH
        ? `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
        : `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=usd`,
    );

    const data = await response.json();

    const price = type === AssetType.ETH ? data.ethereum.usd : data[address!.toLowerCase()].usd;

    return { price };
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching price info: ${error}`);
  }
};
