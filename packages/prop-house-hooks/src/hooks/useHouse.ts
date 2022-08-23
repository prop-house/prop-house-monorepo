import { useQuery } from '@tanstack/react-query';
import { Provider } from '@ethersproject/providers';
import { fetchHouse } from '@prop-house/sdk';

export const useHouse = (ens: string, provider: Provider) => {
  return useQuery(['house'], async () => {
    return await fetchHouse(ens, provider);
  });
};
