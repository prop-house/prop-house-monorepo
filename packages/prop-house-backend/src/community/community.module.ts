import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { CommunitiesController } from './community.controller';
import { Community } from './community.entity';
import { CommunityResolver } from './community.resolver';
import { CommunitiesService } from './community.service';

@Module({
  imports: [TypeOrmModule.forFeature([Community, Auction])],
  controllers: [CommunitiesController],
  providers: [CommunitiesService, AuctionsService, CommunityResolver],
  exports: [TypeOrmModule],
})
export class CommunitiesModule {}
