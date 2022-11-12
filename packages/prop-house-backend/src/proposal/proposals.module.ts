import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Vote } from 'src/vote/vote.entity';
import { Proposal } from './proposal.entity';
import { ProposalsResolver } from './proposal.resolver';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Vote, Auction])],
  controllers: [ProposalsController],
  providers: [ProposalsService, AuctionsService, ProposalsResolver],
  exports: [TypeOrmModule],
})
export class ProposalsModule {}
