import { PropHouse, Custom } from '@prophouse/sdk';
import { PropHouseContext } from '../components';
import { useContext } from 'react';

export const usePropHouse = <CS extends Custom | void = void>(): PropHouse<CS> | undefined => {
  return useContext(PropHouseContext) as PropHouse<CS> | undefined;
};
