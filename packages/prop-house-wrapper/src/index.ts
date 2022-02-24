import { Signer } from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';
import axios from 'axios';
import {
  Auction,
  Proposal,
  StoredAuction,
  StoredFile,
  StoredVote,
  Vote,
} from './builders';
import FormData from 'form-data';
import fs from 'fs';

export class PropHouseWrapper {
  constructor(
    private readonly host: string,
    private readonly signer: Signer | Wallet | undefined = undefined
  ) {}

  async createAuction(auction: Auction): Promise<StoredAuction[]> {
    return (await axios.post(`${this.host}/auctions`, auction)).data;
  }

  async getAuctions(): Promise<StoredAuction[]> {
    const rawAuctions = (await axios.get(`${this.host}/auctions`)).data;
    return rawAuctions.map(StoredAuction.FromResponse);
  }

  async getAllProposals() {
    return (await axios.get(`${this.host}/proposals`)).data;
  }

  async getProposal(id: number) {
    return (await axios.get(`${this.host}/proposals/${id}`)).data;
  }

  async getAuctionProposals(auctionId: number) {
    return (await axios.get(`${this.host}/auctions/${auctionId}/proposals`))
      .data;
  }

  async createProposal(proposal: Proposal) {
    if (!this.signer) return;
    const signedPayload = await proposal.signedPayload(this.signer);
    return (await axios.post(`${this.host}/proposals`, signedPayload)).data;
  }

  async logVote(vote: Vote) {
    if (!this.signer) return;
    const signedPayload = await vote.signedPayload(this.signer);
    return (await axios.post(`${this.host}/votes`, signedPayload)).data;
  }

  async getAddressFiles(address: string): Promise<StoredFile[]> {
    return (await axios.get(`${this.host}/file/${address}`)).data;
  }

  async postFile(file: File, name: string) {
    if (!this.signer) return;
    const form = new FormData();
    form.append('file', file, name);
    form.append('name', name);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const signature = await this.signer.signMessage(fileBuffer);
    form.append('signature', signature);
    console.log(form);
    return await axios.post(`${this.host}/file`, form);
  }

  async postFileBuffer(fileBuffer: Buffer, name: string) {
    if (!this.signer) return;
    const form = new FormData();
    form.append('file', fileBuffer, name);
    form.append('name', name);
    const signature = await this.signer.signMessage(fileBuffer);
    form.append('signature', signature);
    console.log(form);
    console.log(form.getHeaders());
    return await axios.post(`${this.host}/file`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });
  }

  async postFileFromDisk(path: string, name: string) {
    return this.postFileBuffer(fs.readFileSync(path), name);
  }

  async getAddress() {
    if (!this.signer) return undefined;
    return this.signer.getAddress();
  }

  async getVotesByAddress(address: string): Promise<StoredVote[]> {
    return (await axios.get(`${this.host}/votes/by/${address}`)).data;
  }
}
