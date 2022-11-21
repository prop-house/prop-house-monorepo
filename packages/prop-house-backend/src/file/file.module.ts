import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { IpfsModule } from 'src/ipfs/ipfs.module';
import { IpfsService } from 'src/ipfs/ipfs.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([File])],
  providers: [FileService, IpfsService],
  controllers: [FileController],
})
export class FileModule {}
