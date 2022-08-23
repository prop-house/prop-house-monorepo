import { useQuery } from '@tanstack/react-query';
import { Provider } from '@ethersproject/providers';

import { fetchRound } from '@prop-house/sdk';

export const useRound = (ens: string, provider: Provider) => {
  return useQuery(['round'], async () => {
    return await fetchRound(ens, provider);
  });
};
