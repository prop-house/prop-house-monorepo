import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { PostgresDatabaseProviderModule } from './db/postgres.provider';
import { IpfsModule } from './ipfs/ipfs.module';
import { FileModule } from './file/file.module';
import { WebsocketModule } from './websocket/websocket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    PostgresDatabaseProviderModule,
    IpfsModule,
    FileModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
