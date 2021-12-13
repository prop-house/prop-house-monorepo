import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IpfsService } from './ipfs.service';

@Module({
  imports:[ConfigModule.forRoot()],
  providers: [IpfsService]
})
export class IpfsModule {}
