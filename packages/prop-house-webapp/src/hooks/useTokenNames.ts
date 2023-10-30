import { GovPowerStrategyType, ParsedGovPowerStrategy, RoundAward } from '@prophouse/sdk-react';
import { erc721ABI } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { useContractReads } from 'wagmi';

interface TokenNames {
  [address: string]: string;
}

type UseTokenNamesResults = [
  /**
   * loadingNames
   */
  boolean,
  /**
   * names
   */
  TokenNames | undefined,
];

/**
 * Fetches symbols and decimals for each award and returns a FullRoundAward
 */
const useTokenNames = (strategies: ParsedGovPowerStrategy[]): UseTokenNamesResults => {
  const [tokenNames, setTokenNames] = useState<TokenNames | undefined>();

  const contracts = strategies
    .map(strategy => {
      const isErc20OrErc721 = strategy.strategyType === GovPowerStrategyType.BALANCE_OF;

      if (isErc20OrErc721)
        return {
          address: strategy.tokenAddress as `0x${string}`,
          abi: isErc20OrErc721 && erc721ABI,
        };
    })
    .filter(Boolean) as { address: `0x${string}`; abi: readonly any[] }[];

  // fetch names
  const { data, isLoading } = useContractReads({
    contracts: contracts.map(c => {
      return {
        address: c.address,
        abi: c.abi,
        functionName: 'name',
      };
    }),
  });

  useEffect(() => {
    if (!data || isLoading) return;

    const parsedResults: { [address: string]: string } = {};
    data.map((name, index) => {
      parsedResults[contracts[index].address] = name.result as string;
    });
    setTokenNames(parsedResults);
  }, [data]);

  return [isLoading, tokenNames];
};

export default useTokenNames;
