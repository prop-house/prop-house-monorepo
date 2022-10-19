import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { EIP1271SignatureValidationTaskService } from './tasks';
import { VotesService } from 'src/vote/votes.service';
import { Vote } from 'src/vote/vote.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Proposal, Vote, Auction]),
  ],
  providers: [
    ProposalsService,
    VotesService,
    AuctionsService,
    EIP1271SignatureValidationTaskService,
  ],
})
export class TasksModule {}
