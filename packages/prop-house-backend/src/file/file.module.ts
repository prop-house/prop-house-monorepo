import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { IpfsService } from '../ipfs/ipfs.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([File])],
  providers: [FileService, IpfsService],
  controllers: [FileController],
})
export class FileModule {}
