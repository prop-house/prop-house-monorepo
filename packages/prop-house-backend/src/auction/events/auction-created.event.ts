import { Tweetable, TweetableContents } from 'src/twitter/types';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionCreatedEvent implements Tweetable {
  public static EventStatus: EventStatus = 'auctionCreated';

  constructor(private readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `New Prop House Round discovered!

Name: ${this.auction.title}
Begins: ${this.auction.startTime.toLocaleString()}
House: ${(await this.auction.community).name}

${this.auction.url()}`,
      undefined,
    ];
  }
}
