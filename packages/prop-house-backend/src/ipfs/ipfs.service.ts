import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PinataClient, { PinataPinOptions } from '@pinata/sdk';
import fs from 'fs';
import { Readable } from 'stream';
const pinataClient = require('@pinata/sdk');
import { NFTStorage, Blob, File } from 'nft.storage';

@Injectable()
export class IpfsService {
  private ipfsClient: PinataClient;
  private nftStorageClient: NFTStorage;
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('PINATA_API_KEY');
    const apiSecret = this.configService.get<string>('PINATA_API_SECRET');
    this.ipfsClient = new pinataClient(apiKey, apiSecret);
    this.nftStorageClient = new NFTStorage({
      token: this.configService.get<string>('NFT_STORAGE_API_KEY'),
    });
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
    const cid = await this.nftStorageClient.storeBlob(
      new Blob([fs.readFileSync(path)]),
    );
    const pinataResponse = await this.ipfsClient.pinFileToIPFS(
      fileStream,
      options,
    );
    return {
      ...pinataResponse,
      nftStorageCid: cid,
    };
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
    const cid = await this.nftStorageClient.storeBlob(new Blob([buffer]));
    const pinataResponse = await this.ipfsClient.pinFileToIPFS(
      readable,
      options,
    );
    return {
      ...pinataResponse,
      nftStorageCid: cid,
    };
  }
}
