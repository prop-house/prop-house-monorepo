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
      /** REMOVE COMMENTS ONCE NEW SDK IS DEPLOYED AND VOTING STRATS WORK */

      // const strategyVotingPowers = await propHouse.voting.getVotingPowerForStrategies(
      //   account as string,
      //   round.config.proposalPeriodStartTimestamp,
      //   round.votingStrategies,
      // );
      setLoadingVotingPower(false);
      // setVotingPower(
      //   strategyVotingPowers.reduce((prev, current) => {
      //     return current.votingPower.toNumber() + prev;
      //   }, 0),
      // );
      setVotingPower(1);
    } catch (e) {
      console.log('Error fetching voting power: ', e);
      setLoadingVotingPower(false);
      setErrorLoadingVotingPower(true);
    }
  };

  useEffect(() => {
    fetchVotingPower();
  }, [round]);

  // return [loadingVotingPower, errorLoadingVotingPower, votingPower];
  return [false, false, 10];
};

export default useVotingPower;
