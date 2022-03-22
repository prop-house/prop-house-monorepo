import { verifyMessage } from '@ethersproject/wallet';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { File } from './file.entity';
import { FileService } from './file.service';
import { FileUploadDto } from './file.types';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get()
  async getFiles() {
    return this.fileService.findAll();
  }

  @Get('/:address')
  async getFilesByAddress(@Param('address') address: string) {
    return this.fileService.findAllByAddress(address);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() body: FileUploadDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const address = verifyMessage(file.buffer, body.signature);
    const ipfsResult = await this.fileService.pinBuffer(file.buffer, body.name);
    const fileEntity = new File();
    fileEntity.name = body.name;
    fileEntity.address = address;
    fileEntity.ipfsHash = ipfsResult.IpfsHash;
    fileEntity.ipfsTimestamp = ipfsResult.Timestamp;
    fileEntity.pinSize = ipfsResult.PinSize;
    fileEntity.mimeType = file.mimetype;
    this.fileService.store(fileEntity);
  }
}
