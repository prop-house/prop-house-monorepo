import { Round, RoundBalance, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';

export const useRoundBalances = (round: Round, interval: number = 5000) => {
  const [balances, setBalances] = useState<RoundBalance[]>();
  const propHouse = usePropHouse();

  useEffect(() => {
    const fetchBalances = async () => {
      const balances = await propHouse.query.getRoundBalances(round.address);
      setBalances(balances);
    };
    fetchBalances(); // initial fetch
    const _interval = setInterval(fetchBalances, interval);
    return () => clearInterval(_interval);
  }, [propHouse.query, round]);
  return balances;
};
