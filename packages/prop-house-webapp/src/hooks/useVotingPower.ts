import { useEffect, useState } from 'react';
import { Round, usePropHouse } from '@prophouse/sdk-react';
import { BigNumber } from 'ethers';

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

const useVotingPower = (
  round: Round | undefined,
  account: `0x${string}` | undefined,
): UseVotingPowerResults => {
  const [loadingVotingPower, setLoadingVotingPower] = useState(false);
  const [errorLoadingVotingPower, setErrorLoadingVotingPower] = useState(false);
  const [votingPower, setVotingPower] = useState<null | number>(null);

  const propHouse = usePropHouse();

  useEffect(() => {
    const fetchVotingPower = async () => {
      if (!round || !account) return;

      setLoadingVotingPower(true);
      try {
        const govPower = await propHouse.govPower.getTotalPower(
          account as string,
          round.config.proposalPeriodStartTimestamp,
          round.votingStrategiesRaw,
        );
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
  }, [round, propHouse.govPower, account]);

  return [loadingVotingPower, errorLoadingVotingPower, votingPower];
};

export default useVotingPower;
