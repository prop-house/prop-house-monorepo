import { RoundAward } from '@prophouse/sdk-react';
import { erc20ABI, erc721ABI } from '@wagmi/core';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';
import { formatUnits } from 'ethers/lib/utils';
import { useContractReads } from 'wagmi';

interface FullRoundAward extends RoundAward {
  symbol: string;
  decimals: number | undefined;
  parsedAmount: number;
}

type UseFullRoundAwardResults = [
  /**
   * loadingSymbols
   */
  boolean,
  /**
   * loadingDecimals
   */
  boolean,
  /**
   * votingPower
   */
  FullRoundAward[] | undefined,
];

/**
 * Fetches symbols and decimals for each award and returns a FullRoundAward
 */
const useFullRoundAwards = (awards: RoundAward[]): UseFullRoundAwardResults => {
  const [fullRoundAwards, setFullRoundAwards] = useState<FullRoundAward[] | undefined>();

  const awardContracts = awards.map(award => {
    return {
      address: award.asset.token as `0x${string}`,
      abi: award.asset.assetType === 'ERC20' ? erc20ABI : erc721ABI,
    };
  });

  // fetch symbols
  const { data: symbols, isLoading: loadingSymbols } = useContractReads({
    contracts: awardContracts.map(awardContract => {
      return { ...awardContract, functionName: 'symbol' };
    }),
  });

  // fetch decimals
  const { data: decimals, isLoading: loadingDecimals } = useContractReads({
    contracts: awardContracts.map(awardContract => {
      return { ...awardContract, functionName: 'decimals' };
    }),
  });

  // parse symbols, decimals and amounts into award as FullRoundAward
  useEffect(() => {
    if (!symbols || fullRoundAwards || !decimals) return;

    const parsedAmounts = awards.map((award, index) => {
      switch (award.asset.assetType) {
        case 'NATIVE':
          return Number(formatEther(BigInt(award.amount)));
        case 'ERC20':
          return Number(formatUnits(BigInt(award.amount), decimals[index].result as number));
        case 'ERC721':
        case 'ERC1155': //todo handle er`1155: sometimes it's an erc20, sometimes its an erc721
          return 1;
        default:
          return 1;
      }
    });

    setFullRoundAwards(
      awards.map((award, index) => {
        return {
          ...award,
          symbol: award.asset.assetType === 'NATIVE' ? 'ETH' : (symbols[index].result as string),
          decimals: decimals[index].result as number | undefined,
          parsedAmount: parsedAmounts[index],
        };
      }),
    );
  }, [symbols, fullRoundAwards, decimals, awards]);

  return [loadingSymbols, loadingDecimals, fullRoundAwards];
};

export default useFullRoundAwards;
