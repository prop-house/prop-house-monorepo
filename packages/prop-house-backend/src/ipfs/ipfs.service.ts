import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PinataClient, { PinataPinOptions } from '@pinata/sdk';
import fs from 'fs';
import { Readable } from 'stream';
const pinataClient = require('@pinata/sdk');

@Injectable()
export class IpfsService {
  private ipfsClient: PinataClient;
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('PINATA_API_KEY');
    const apiSecret = this.configService.get<string>('PINATA_API_SECRET');
    this.ipfsClient = new pinataClient(apiKey, apiSecret);
  }

  async pinFile(path: string, name: string, keyvalues: any = {}) {
    const fileStream = fs.createReadStream(path);
    const options: PinataPinOptions = {
      pinataMetadata: {
        name,
        keyvalues,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };
    return this.ipfsClient.pinFileToIPFS(fileStream, options);
  }

  async pinBuffer(buffer: Buffer, name: string, keyValues: any = {}) {
    const options: PinataPinOptions = {
      pinataMetadata: {
        name,
        keyvalues: keyValues,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };
    const readable = Readable.from(buffer);
    // Have to add this .path hack for pinata sdk
    /// @ts-ignore
    readable.path = name;
    return this.ipfsClient.pinFileToIPFS(readable, options);
  }
}
