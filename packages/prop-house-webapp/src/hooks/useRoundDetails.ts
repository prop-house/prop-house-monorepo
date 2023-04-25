import { PropHouse, Round, RoundWithHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { activeTimedFundingRoundFilter } from '../utils/sdk';

type Refresh = () => Promise<void>;
export const useRoundDetails = (
  propHouseProvider: PropHouse,
  roundAddress: string,
): [RoundWithHouse | undefined, Refresh, boolean] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [roundDetails, setRoundDetails] = useState<RoundWithHouse | undefined>(undefined);

  const fetchRoundDetails = async () => {
    setLoading(true);
    const round = await propHouseProvider.query.getRoundWithHouseInfo(roundAddress);
    setRoundDetails(round);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoundDetails();
  }, [roundAddress]);

  return [roundDetails, fetchRoundDetails, loading];
};
