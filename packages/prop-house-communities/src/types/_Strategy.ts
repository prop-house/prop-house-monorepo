import { BaseArgs } from '../actions/execStrategy';

export type StrategyFactory<T extends BaseArgs> = (params: T) => _Strategy;

export type _Strategy = () => Promise<number>;
