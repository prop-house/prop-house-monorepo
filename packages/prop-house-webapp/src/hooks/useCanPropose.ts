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

  useEffect(() => {
    const fetchCanPropose = async () => {
      if (!round) return;

      setLoadingCanPropose(true);
      try {
        const govPower = await propHouse.govPower.getTotalPower(
          account as string,
          round.config.proposalPeriodStartTimestamp,
          round.proposingStrategiesRaw,
        );
        setCanPropose(govPower.toNumber() >= round.config.proposalThreshold);
        setLoadingCanPropose(false);
      } catch (e) {
        console.log('Error fetching canPropose: ', e);
        setLoadingCanPropose(false);
        setErrorLoadingCanPropose(true);
      }
    };
    fetchCanPropose();
  }, [round, account, propHouse.govPower]);

  return [loadingCanPropose, errorLoadingCanPropose, canPropose];
};

export default useCanPropose;
