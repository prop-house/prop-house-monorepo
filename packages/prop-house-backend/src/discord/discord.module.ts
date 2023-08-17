import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { ProposalsService } from 'src/proposal/proposals.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from 'src/proposal/proposal.entity';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';

@Module({
  controllers: [DiscordController],
  imports: [TypeOrmModule.forFeature([Proposal, InfiniteAuction, Auction])],
  providers: [
    DiscordService,
    ProposalsService,
    ConfigService,
    InfiniteAuctionService,
    AuctionsService
  ],
})
export class DiscordModule {}
