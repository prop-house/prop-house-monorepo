import { ClientConfig, StarknetVotingStrategy } from '../../../../types';
import type { ProposeMessage, TimedFundingRoundEnvelope, VoteMessage } from '../types';

export const vanillaVotingStrategy: StarknetVotingStrategy<TimedFundingRoundEnvelope> = {
  type: 'vanilla',
  async getParams(
    _address: string,
    _index: number,
    _envelope: TimedFundingRoundEnvelope<ProposeMessage | VoteMessage>,
    _clientConfig: ClientConfig,
  ): Promise<string[]> {
    return [];
  },
};
