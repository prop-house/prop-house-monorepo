import type { Call } from 'starknet';
import type {
  TimedFundingRoundAuthStrategy,
  TimedFundingRoundEnvelope,
  ProposeMessage,
  VoteMessage,
} from '../types';

export const vanillaAuthStrategy: TimedFundingRoundAuthStrategy = {
  type: 'vanilla',
  createCall(
    envelope: TimedFundingRoundEnvelope<ProposeMessage | VoteMessage>,
    selector: string,
    calldata: string[],
  ): Call {
    const { houseStrategy, authStrategy } = envelope.data.message;

    return {
      contractAddress: authStrategy,
      entrypoint: 'authenticate',
      calldata: [houseStrategy, selector, calldata.length, ...calldata],
    };
  },
};
