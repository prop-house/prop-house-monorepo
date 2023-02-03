import { TimedFundingRoundConfig } from './timed-funding-round';

export enum FundingHouseStrategyType {
  TIMED_FUNDING_ROUND = 'TIMED_FUNDING_ROUND',
}

export interface TimedFundingRoundStrategy {
  strategyType: FundingHouseStrategyType.TIMED_FUNDING_ROUND;
  config?: TimedFundingRoundConfig;
}

export type FundingHouseStrategy = TimedFundingRoundStrategy;
