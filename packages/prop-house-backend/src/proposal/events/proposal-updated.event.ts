import { Tweetable, TweetableContents } from 'src/twitter/types';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Proposal } from '../proposal.entity';

export class ProposalUpdatedEvent {
  constructor(public readonly proposal: Proposal) {}
}
