import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { PostgresDatabaseProviderModule } from './db/postgres.provider';
import { IpfsModule } from './ipfs/ipfs.module';
import { FileModule } from './file/file.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { TwitterModule } from './twitter/twitter.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AuctionWatcherModule } from './auction-watcher/auction-watcher.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PostgresDatabaseProviderModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    IpfsModule,
    FileModule,
    TwitterModule,
    AuctionWatcherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
