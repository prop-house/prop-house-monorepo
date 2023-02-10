import { ContractAddresses } from '../addresses';
import { encodeTimedFundingRoundConfig } from '../rounds';
import { RoundType, Round } from '../types';

/**
 * Returns the ABI-encoded configuration for the provided `round`
 * @param round The round information
 */
export const encodeConfig = <RT extends RoundType>(round: Round<RT>) => {
  switch (round.roundType) {
    case RoundType.TIMED_FUNDING:
      return encodeTimedFundingRoundConfig(round.config);
    default:
      throw new Error(`Unknown round type: ${round.roundType}`);
  }
};

/**
 * Returns the address for the provided round type from `addresses`
 * @param roundType The round type
 * @param addresses The contract addresses
 */
export const addressForType = (roundType: RoundType, addresses: ContractAddresses) => {
  const roundTypes: Record<RoundType, string> = {
    [RoundType.TIMED_FUNDING]: addresses.evm.round.timedFunding,
  };
  if (!roundTypes[roundType]) {
    throw new Error(`Unknown round type: ${roundType}`);
  }
  return roundTypes[roundType];
};
