import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsModule } from 'src/auction/auctions.module';
import configuration from 'src/config/configuration';
import { PostgresDatabaseProviderModule } from 'src/db/postgres.provider';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsModule } from 'src/proposal/proposals.module';
import { Vote } from 'src/vote/vote.entity';
import { VotesModule } from 'src/vote/votes.module';
import { Seeder } from './seeder.provider';

@Module({
  imports: [
    Logger,
    ConfigModule.forRoot({
      load: [configuration],
    }),
    VotesModule,
    AuctionsModule,
    ProposalsModule,
    PostgresDatabaseProviderModule,
    TypeOrmModule.forFeature([Auction])
  ],
  controllers: [],
  providers: [Seeder],
  exports: [TypeOrmModule],
})
export class SeederModule {}
