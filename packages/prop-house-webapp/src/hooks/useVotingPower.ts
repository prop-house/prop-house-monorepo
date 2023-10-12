import { useEffect, useState } from 'react';
import { Round, usePropHouse } from '@prophouse/sdk-react';

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

  const fetchVotingPower = async () => {
    if (!round) return;

    setLoadingVotingPower(true);
    try {
      const govPower = await propHouse.govPower.getTotalPower(
        account as string,
        round.config.proposalPeriodStartTimestamp,
        round.votingStrategiesRaw,
      );
      setLoadingVotingPower(false);
      setVotingPower(govPower.toNumber());
      console.log(govPower.toNumber());
    } catch (e) {
      console.log('Error fetching voting power: ', e);
      setLoadingVotingPower(false);
      setErrorLoadingVotingPower(true);
    }
  };

  useEffect(() => {
    fetchVotingPower();
  }, [round]);

  return [loadingVotingPower, errorLoadingVotingPower, votingPower];
};

export default useVotingPower;
