import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { EIP1271SignatureValidationTaskService } from './tasks';
import { VotesService } from '../vote/votes.service';
import { Vote } from '../vote/vote.entity';
import { InfiniteAuctionService } from '../infinite-auction/infinite-auction.service';
import { InfiniteAuction } from '../infinite-auction/infinite-auction.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Proposal, Vote, Auction, InfiniteAuction]),
  ],
  providers: [
    ProposalsService,
    InfiniteAuctionService,
    VotesService,
    AuctionsService,
    EIP1271SignatureValidationTaskService,
  ],
})
export class TasksModule {}
