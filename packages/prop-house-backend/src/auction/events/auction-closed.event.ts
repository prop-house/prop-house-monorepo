import { Tweetable, TweetableContents } from 'src/twitter/types';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionClosedEvent implements Tweetable {
  public static EventStatus: EventStatus = 'auctionClosed';

  constructor(private readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `Prop House Round ${this.auction.title} has finished!
    
${this.auction.url()}`,
      undefined,
    ];
  }
}
