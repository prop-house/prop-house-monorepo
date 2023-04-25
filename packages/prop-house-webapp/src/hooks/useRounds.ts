import { PropHouse, Round } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { activeTimedFundingRoundFilter } from '../utils/sdk';

type Refresh = () => Promise<void>;
export const useRounds = (propHouseProvider: PropHouse): [Round[], Refresh, boolean] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [activeRounds, setRounds] = useState<Round[]>([]);

  const fetchRounds = async () => {
    setLoading(true);
    const rounds = await propHouseProvider.query.getRounds();
    setRounds(rounds);
    setLoading(false);
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  return [activeRounds, fetchRounds, loading];
};
