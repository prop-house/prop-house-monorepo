import { PropHouse, Custom } from '@prophouse/sdk';
import { PropHouseContext } from '../components';
import { useContext } from 'react';

export const usePropHouse = <CS extends Custom | void = void>(): PropHouse<CS> => {
  const propHouse = useContext(PropHouseContext) as PropHouse<CS> | undefined;
  if (!propHouse) {
    throw new Error(`You must provide a PropHouse instance via the PropHouseProvider`);
  }
  return propHouse;
};
