import { Strategy } from './Strategy';

export interface RoundStrategies {
  [roundId: number]: Strategy;
}
