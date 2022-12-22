import { Tweetable, TweetableContents } from 'src/twitter/types';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Proposal } from '../proposal.entity';

export class ProposalCreatedEvent implements Tweetable {
  constructor(public readonly proposal: Proposal) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `A new proposal has been created!

Proposal: ${this.proposal.title} by ${this.proposal.address}
    
Round: ${this.proposal.auction.title}

https://prop.house/proposal/${this.proposal.id}`,
      undefined,
    ];
  }
}
