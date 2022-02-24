import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Auction } from './auction.entity';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Proposal])],
  controllers: [AuctionsController],
  providers: [AuctionsService, ProposalsService],
  exports: [TypeOrmModule],
})
export class AuctionsModule {}
