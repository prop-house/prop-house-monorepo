import { Tweetable, TweetableContents } from 'src/twitter/types';
import { SendTweetV2Params } from 'twitter-api-v2';
import { Auction } from '../auction.entity';
import { EventStatus } from '../types';

export class AuctionOpenEvent implements Tweetable {
  public static EventStatus: EventStatus = 'auctionOpen';

  constructor(private readonly auction: Auction) {}

  async tweetContents(): Promise<TweetableContents> {
    return [
      `The Prop House Round ${
        this.auction.title
      } is now open for proposals! Submit yours to ${this.auction.url()}`,
      undefined,
    ];
  }
}
