export * from './vanilla';
export * from './single-slot-proof';

import { vanillaVotingStrategy } from './vanilla';
import { singleSlotProofVotingStrategy } from './single-slot-proof';

// prettier-ignore
export const DEFAULT_VOTING_STRATEGIES = {
  '0xed7c4a12b742cf3a8ac72aa878f392d673cdd834a85035160e31f43456d361': vanillaVotingStrategy,
  '0x504ed81400d05b45ff570f85ac231691185f24242aa0ea67f0d8533475f38f5': singleSlotProofVotingStrategy,
};
