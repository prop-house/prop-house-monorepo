import { Tweetable, TweetableContents } from 'src/twitter/types';
import { tweetDate } from 'src/utils';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionCreatedEvent implements Tweetable {
  public static EventStatus: EventStatus = 'auctionCreated';

  constructor(private readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
`New round has been discovered for ${this.auction.community.name} House: ${this.auction.title}

- ${this.auction.numWinners} winners will be awarded ${this.auction.fundingAmount} ${this.auction.currencyType ?? "ETH"}. 
- Proposing starts ${tweetDate(this.auction.startTime)}

Learn more: ${this.auction.url()}`,
      undefined,
    ];
  }
}
