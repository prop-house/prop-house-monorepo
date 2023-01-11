import { AuctionTweetable, TweetableContents } from 'src/twitter/types';
import { tweetDate } from 'src/utils';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionOpenEvent implements AuctionTweetable {
  public static EventStatus: EventStatus = 'auctionOpen';

  constructor(public readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `${this.auction.community.name} ${
        this.auction.title
      } is now open for proposals:

- ${this.auction.numWinners} winners will be awarded ${
        this.auction.fundingAmount
      } ${this.auction.currencyType ?? 'ETH'}. 
- Proposing ends ${tweetDate(this.auction.proposalEndTime)}

Learn more: ${this.auction.url()}`,
      undefined,
    ];
  }
}
