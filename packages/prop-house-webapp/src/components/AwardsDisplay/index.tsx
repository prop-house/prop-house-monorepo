import { RoundAward } from '@prophouse/sdk-react/node_modules/@prophouse/sdk/dist/gql/types';
import StatusPill, { StatusPillColor } from '../StatusPill';
import { useContractReads } from 'wagmi';
import { erc20ABI, erc721ABI } from '@wagmi/core';
import { formatEther } from 'viem';
import LoadingIndicator from '../LoadingIndicator';
import { useEffect, useState } from 'react';

const AwardsDisplay: React.FC<{ awards: RoundAward[] }> = props => {
  const { awards } = props;

  // if native, amount + "ETH"
  // if erc20, fetch name, fetch decimals, => formattedUnits + NAME
  // if erc721, fetch name, amount + NAME
  // if erc1155, fetch name, amount + name

  const contracts = awards.map(award => {
    return {
      address: '0x5e932688E81a182e3dE211dB6544F98b8e4f89C7' as `0x${string}`,
      abi: award.asset.assetType === 'ERC20' ? erc20ABI : erc721ABI,
    };
  });

  const {
    data: symbols,
    isError,
    isLoading,
  } = useContractReads({
    contracts: contracts.map(contract => {
      return { ...contract, functionName: 'symbol' };
    }),
  });

  interface data {
    amount: number;
    symbol: string;
  }

  useEffect(() => {
    if (!symbols) return;

    const final = awards.map((award, index) => {
      if (award.asset.assetType === 'NATIVE')
        return { amount: formatEther(BigInt(award.amount)), name: 'ETH' };
      if (award.asset.assetType === 'ERC20')
        return {
          amount: 1,
          name: symbols[index].result,
        };
      return {
        amount: 1,
        name: symbols[index].result,
      };
    });
    console.log(final);
  });

  console.log();

  return !symbols ? (
    <LoadingIndicator height={18} width={26} />
  ) : awards.length === 1 ? (
    <></>
  ) : (
    <StatusPill copy={`Multiple`} color={StatusPillColor.Green} size={18} />
  );
};
export default AwardsDisplay;
