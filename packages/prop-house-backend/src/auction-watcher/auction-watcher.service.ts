import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { AuctionClosedEvent } from 'src/auction/events/auction-closed.event';
import { AuctionCreatedEvent } from 'src/auction/events/auction-created.event';
import { AuctionOpenEvent } from 'src/auction/events/auction-open.event';
import { AuctionProposalEndingSoonEvent } from 'src/auction/events/auction-proposal-end-soon.event';
import { AuctionVotingEndingSoonEvent } from 'src/auction/events/auction-vote-end-soon.event';
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
    const allActiveAuctions = await this.auctionService.findAllActive()

    for (const auction of allActiveAuctions) {
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
          if (!auction.proposalWindowEndingSoon()) {
            // Proposal is open but not yet in the proposal closing soon window
            continue;
          }
          this.logger.debug(
            `Auction moving to proposal closing soon state ${auction.id}`,
          );
          this.events.emit(
            AuctionProposalEndingSoonEvent.name,
            new AuctionProposalEndingSoonEvent(auction),
          );
          auction.eventStatus = AuctionProposalEndingSoonEvent.EventStatus;
          break;
        case 'auctionProposalEndingSoon':
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
          if (!auction.proposalVotingEndingSoon()) {
            // Auction in voting state but is not yet in closing soon window
            continue;
          }
          this.logger.debug(
            `Auction moving into closing soon state ${auction.id}`,
          );
          this.events.emit(
            AuctionVotingEndingSoonEvent.name,
            new AuctionVotingEndingSoonEvent(auction),
          );
          auction.eventStatus = AuctionVotingEndingSoonEvent.EventStatus;
          break;
        case 'auctionVotingEndingSoon':
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
}
