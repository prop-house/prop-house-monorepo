import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { AuctionWatcherService } from './auction-watcher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auction])],
  controllers: [],
  providers: [AuctionsService, AuctionWatcherService],
  exports: [],
})
export class AuctionWatcherModule {}
