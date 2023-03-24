import { PropHouse, Custom } from '@prophouse/sdk';
import { PropHouseContext } from '../components';
import { useContext } from 'react';

export const usePropHouse = <CS extends Custom | void = void>(): PropHouse<CS> => {
  const propHouse = useContext(PropHouseContext);

  if (!propHouse) {
    throw new Error('You must provide PropHouse via PropHouseProvider');
  }

  return propHouse as PropHouse<CS>;
};
