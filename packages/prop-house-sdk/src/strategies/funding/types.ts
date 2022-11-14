import { BigNumberish } from '@ethersproject/bignumber';

export enum FundingHouseStrategyType {
  TIMED_FUNDING_ROUND = 'TIMED_FUNDING_ROUND',
}

export interface TimedFundingRoundConfig {
  proposalPeriodStartTimestamp: number;
  proposalPeriodDuration: number;
  votePeriodDuration: number;
  winnerCount: number;
}

export interface TimedFundingRoundStrategy {
  strategyType: FundingHouseStrategyType.TIMED_FUNDING_ROUND;
  config: TimedFundingRoundConfig;
  validator?: string;
}

export type FundingHouseStrategy = TimedFundingRoundStrategy;

export interface ProposalVote {
  proposalId: number;
  votingPower: BigNumberish;
}
