import { _strategies } from '../_strategies';

export const getStrategy = (strategyName: string) => {
  return _strategies.get(strategyName);
};
