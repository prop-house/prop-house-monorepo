import { useEffect, useState } from 'react';
import { Round, usePropHouse } from '@prophouse/sdk-react';

export type UseCanProposeResults = [
  /**
   * loadingCanPropose
   */
  boolean,
  /**
   * errorLoadingCanPropose
   */
  boolean,
  /**
   * canPropose
   */
  boolean | undefined | null,
];

const useCanPropose = (
  round: Round | undefined,
  account: `0x${string}` | undefined,
): UseCanProposeResults => {
  const [loadingCanPropose, setLoadingCanPropose] = useState(false);
  const [errorLoadingCanPropose, setErrorLoadingCanPropose] = useState(false);
  const [canPropose, setCanPropose] = useState<null | boolean>(null);

  const propHouse = usePropHouse();

  const fetchCanPropose = async () => {
    if (!round) return;

    setLoadingCanPropose(true);
    try {
      /** TODO: REMOVE COMMENTS ONCE NEW SDK IS DEPLOYED AND VOTING STRATS WORK */

      // const strategyVotingPowers = await propHouse.voting.getVotingPowerForStrategies(
      //   account as string,
      //   round.config.proposalPeriodStartTimestamp,
      //   round.votingStrategies,
      // );
      setLoadingCanPropose(false);
      // setVotingPower(
      //   strategyVotingPowers.reduce((prev, current) => {
      //     return current.votingPower.toNumber() + prev;
      //   }, 0),
      // );
      setCanPropose(true);
    } catch (e) {
      console.log('Error fetching canPropose: ', e);
      setLoadingCanPropose(false);
      setErrorLoadingCanPropose(true);
    }
  };

  useEffect(() => {
    fetchCanPropose();
  }, [round]);

  //   return [loadingCanPropose, errorLoadingCanPropose, canPropose]
  return [false, false, true];
};

export default useCanPropose;
