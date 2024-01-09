import { useEffect, useState } from 'react';
import { RawGovPowerStrategy, Round, usePropHouse } from '@prophouse/sdk-react';
import { ethers, BigNumber } from 'ethers';
import useErc20AddressDecimals from './useErc20AddressDecimals';

export type UseVotingPowerResults = [
  /**
   * loadingVotingPower
   */
  boolean,
  /**
   * errorLoadingVotingPower
   */
  boolean,
  /**
   * votingPower
   */
  number | undefined | null,
];

type GovPowerResult = {
  strategy: RawGovPowerStrategy & {
    address: string;
  };
  govPower: ethers.BigNumber;
};

const useVotingPower = (
  round: Round | undefined,
  account: `0x${string}` | undefined,
): UseVotingPowerResults => {
  const [loadingVotingPower, setLoadingVotingPower] = useState(false);
  const [errorLoadingVotingPower, setErrorLoadingVotingPower] = useState(false);
  const [votingPower, setVotingPower] = useState<null | number>(null);

  const propHouse = usePropHouse();

  const erc20Addresses = round
    ? round.votingStrategies
        .filter(s => s.strategyType === 'BALANCE_OF_ERC20')
        .map((s: any) => s.tokenAddress)
    : [];
  const erc20Decimals = useErc20AddressDecimals(erc20Addresses);

  const sumUpGovPowers = (powers: GovPowerResult[], erc20Decimals: number[]) => {
    let sum = 0;
    powers.forEach((power, i) => {
      let parsed;
      let counter = 0;
      if (power.strategy.type === 'BALANCE_OF_ERC20') {
        parsed = parseFloat(ethers.utils.formatUnits(power.govPower, erc20Decimals[counter]));
        counter++;
      } else {
        parsed = power.govPower.toNumber();
      }
      sum += parsed;
    });
    return sum;
  };

  useEffect(() => {
    if (erc20Addresses.length > 0 && !erc20Decimals) return;

    const fetchVotingPower = async () => {
      if (!round || !account) return;

      setLoadingVotingPower(true);
      try {
        const powers = await propHouse.govPower.getPowerForStrategies(
          account as string,
          round.config.proposalPeriodEndTimestamp,
          round.votingStrategiesRaw,
        );
        const govPower = BigNumber.from(sumUpGovPowers(powers, erc20Decimals!));
        setLoadingVotingPower(false);

        const maxSafeInteger = BigNumber.from(Number.MAX_SAFE_INTEGER.toString());
        setVotingPower(govPower.gt(maxSafeInteger) ? Number.MAX_SAFE_INTEGER : govPower.toNumber());
      } catch (e) {
        console.log('Error fetching voting power: ', e);
        setLoadingVotingPower(false);
        setErrorLoadingVotingPower(true);
      }
    };
    fetchVotingPower();
  }, [round, propHouse.govPower, account, erc20Decimals, erc20Addresses.length]);

  return [loadingVotingPower, errorLoadingVotingPower, votingPower];
};

export default useVotingPower;
