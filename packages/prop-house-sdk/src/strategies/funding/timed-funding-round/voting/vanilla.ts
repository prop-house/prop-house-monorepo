import { ClientConfig, VotingStrategy } from '../../../types';
import type { ProposeMessage, TimedFundingRoundEnvelope, VoteMessage } from '../types';

export const vanillaVotingStrategy: VotingStrategy<TimedFundingRoundEnvelope> = {
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
