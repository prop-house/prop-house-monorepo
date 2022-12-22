import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { AuctionClosedEvent } from 'src/auction/events/auction-closed.event';
import { AuctionCreatedEvent } from 'src/auction/events/auction-created.event';
import { AuctionOpenEvent } from 'src/auction/events/auction-open.event';
import { AuctionVotingEvent } from 'src/auction/events/auction-voting.event';

@Injectable()
export class AuctionWatcherService {
  private readonly logger = new Logger(AuctionWatcherService.name);
  constructor(
    private readonly auctionService: AuctionsService,
    private readonly events: EventEmitter2,
  ) {}

  @Cron('*/15 * * * * *')
  async handleCron() {
    this.logger.debug('Checking for Auction status changes');
    const allAuctions = (
      await this.auctionService.findAllWithCommunity()
    ).filter((auction: Auction) => !this.auctionFinalized(auction));

    for (const auction of allAuctions) {
      switch (auction.eventStatus) {
        case null:
          // Discover the auction in all cases
          this.logger.debug(`Discovered a new auction ${auction.id}`);
          this.events.emit(
            AuctionCreatedEvent.name,
            new AuctionCreatedEvent(auction),
          );
          auction.eventStatus = AuctionCreatedEvent.EventStatus;
          break;
        case 'auctionCreated':
          if (!auction.withinProposalWindow()) {
            // Proposal discovered but the start time is still
            // in the future, nothing to do
            continue;
          }
          this.logger.debug(`Auction moving into open state ${auction.id}`);
          this.events.emit(
            AuctionOpenEvent.name,
            new AuctionOpenEvent(auction),
          );
          auction.eventStatus = AuctionOpenEvent.EventStatus;
          break;
        case 'auctionOpen':
          if (!auction.withinVotingWindow()) {
            // Proposal is open but not yet in the proposal window
            continue;
          }
          this.logger.debug(`Auction moving to voting state ${auction.id}`);
          this.events.emit(
            AuctionVotingEvent.name,
            new AuctionVotingEvent(auction),
          );
          auction.eventStatus = AuctionVotingEvent.EventStatus;
          break;
        case 'auctionVoting':
          if (!auction.complete()) {
            // Auction in voting state but is not yet complete
            continue;
          }
          this.logger.debug(`Auction moving into closed state ${auction.id}`);
          this.events.emit(
            AuctionClosedEvent.name,
            new AuctionClosedEvent(auction),
          );
          auction.eventStatus = AuctionClosedEvent.EventStatus;
          break;
        case 'auctionClosed':
          continue;
          break;
        default:
          this.logger.debug(
            `Auction with unknown event state ${auction.id} ${auction.eventStatus}`,
          );
          continue;
      }
      this.logger.debug(`Saving updated auction (${auction.id})`);
      await this.auctionService.store(auction);
    }
  }

  /**
   * Test if auction is finalized (final event has already been
   * emitted)
   */
  private auctionFinalized(auction: Auction): boolean {
    return (
      auction.votingEndTime < new Date() &&
      // Already processed
      (auction.eventStatus === 'auctionClosed' ||
        // Never processed but was also never discovered
        auction.eventStatus === null)
    );
  }
}
