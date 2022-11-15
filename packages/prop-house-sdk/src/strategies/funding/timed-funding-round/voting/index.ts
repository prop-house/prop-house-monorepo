export * from './vanilla';
export * from './single-slot-proof';

import { vanillaVotingStrategy } from './vanilla';
import { singleSlotProofVotingStrategy } from './single-slot-proof';

export const DEFAULT_VOTING_STRATEGIES = {
  '0xdeadbeef1': vanillaVotingStrategy,
  '0xdeadbeef2': singleSlotProofVotingStrategy,
};
