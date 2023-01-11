import { Tweetable, TweetableContents } from 'src/twitter/types';
import { tweetDate } from 'src/utils';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionVotingEvent implements Tweetable {
  public static EventStatus: EventStatus = 'auctionVoting';

  constructor(private readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `${this.auction.community.name} ${this.auction.title} is now open for voting: 

- ${this.auction.community.name} house voters can now vote for their favorite props
- Winners will be awarded ${this.auction.fundingAmount} ${this.auction.currencyType ?? "ETH"}. 
- Voting ends ${tweetDate(this.auction.votingEndTime)}

Vote now: ${this.auction.url()}`,
      undefined,
    ];
  }
}
