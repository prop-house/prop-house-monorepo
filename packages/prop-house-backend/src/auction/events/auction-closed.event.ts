import { Tweetable, TweetableContents } from 'src/twitter/types';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionClosedEvent implements Tweetable {
  public static EventStatus: EventStatus = 'auctionClosed';

  constructor(private readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `${this.auction.community.name} ${this.auction.title} has now ended: 

- ${this.auction.proposals.reduce((acc, prop) => acc + Number(prop.voteCount), 0)} votes were cast
- ${this.auction.numWinners} winners will be awarded ${this.auction.fundingAmount} ${this.auction.currencyType ?? "ETH"}. 

Learn more: ${this.auction.url()}`,
      undefined,
    ];
  }
}
