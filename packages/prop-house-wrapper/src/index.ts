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
  Community,
  CommunityWithAuctions,
} from './builders';
import FormData from 'form-data';
import fs from 'fs';
import { ProposalMessageTypes, VoteMessageTypes } from './types/eip712Types';
import { multiVoteSignature } from './utils/multiVoteSignature';
import { multiVotePayload } from './utils/multiVotePayload';

export class PropHouseWrapper {
  constructor(
    private readonly host: string,
    private readonly signer: Signer | Wallet | undefined = undefined,
  ) {}

  async createAuction(auction: Auction): Promise<StoredAuction[]> {
    try {
      return (await axios.post(`${this.host}/auctions`, auction)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAuction(id: number): Promise<StoredAuction> {
    try {
      const rawAuction = (await axios.get(`${this.host}/auctions/${id}`)).data;
      return StoredAuction.FromResponse(rawAuction);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAuctions(): Promise<StoredAuction[]> {
    try {
      const rawAuctions = (await axios.get(`${this.host}/auctions`)).data;
      return rawAuctions.map(StoredAuction.FromResponse);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAuctionsForCommunity(id: number): Promise<StoredAuction[]> {
    try {
      const rawAuctions = (await axios.get(`${this.host}/auctions/forCommunity/${id}`)).data;
      return rawAuctions.map(StoredAuction.FromResponse);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAuctionWithNameForCommunity(
    auctionName: string,
    communityId: number,
  ): Promise<StoredAuction> {
    try {
      const rawAuction = (
        await axios.get(`${this.host}/auctions/${auctionName}/community/${communityId}`)
      ).data;
      return StoredAuction.FromResponse(rawAuction);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getProposals(limit = 20, skip = 0, order: 'ASC' | 'DESC' = 'DESC') {
    try {
      const { data } = await axios.get(`${this.host}/proposals`, {
        params: {
          limit,
          skip,
          order,
        },
      });
      return data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getProposal(id: number) {
    try {
      return (await axios.get(`${this.host}/proposals/${id}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAuctionProposals(auctionId: number) {
    try {
      return (await axios.get(`${this.host}/auctions/${auctionId}/proposals`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async createProposal(proposal: Proposal, isContract = false) {
    if (!this.signer) return;
    try {
      const signedPayload = await proposal.signedPayload(
        this.signer,
        isContract,
        ProposalMessageTypes,
      );
      return (await axios.post(`${this.host}/proposals`, signedPayload)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async logVotes(votes: Vote[], isContract = false) {
    if (!this.signer) return;

    try {
      // sign payload and use for all votes, awaiting if the signer is not a contract
      let signature = '0x';
      const payload = multiVotePayload(votes);

      const signaturePromise = multiVoteSignature(this.signer, isContract, payload);
      if (!isContract) {
        signature = await signaturePromise;
      }

      let responses = [];

      // POST each vote with the signature of the payload of all votes
      for (const vote of votes) {
        const signedPayload = await vote.presignedPayload(
          this.signer,
          signature,
          JSON.stringify(payload),
          VoteMessageTypes,
        );
        responses.push((await axios.post(`${this.host}/votes`, signedPayload)).data);
      }
      return responses;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getAddressFiles(address: string): Promise<StoredFile[]> {
    try {
      return (await axios.get(`${this.host}/file/${address}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async postFile(file: File, name: string) {
    if (!this.signer) return;
    try {
      const form = new FormData();
      form.append('file', file, name);
      form.append('name', name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const signature = await this.signer.signMessage(fileBuffer);
      form.append('signature', signature);
      console.log(form);
      return await axios.post(`${this.host}/file`, form);
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async postFileBuffer(fileBuffer: Buffer, name: string) {
    if (!this.signer) return;
    try {
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
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async postFileFromDisk(path: string, name: string) {
    return this.postFileBuffer(fs.readFileSync(path), name);
  }

  async getAddress() {
    if (!this.signer) return undefined;
    return this.signer.getAddress();
  }

  async getVotesByAddress(address: string): Promise<StoredVote[]> {
    try {
    } catch (e: any) {
      throw e.response.data.message;
    }
    return (await axios.get(`${this.host}/votes/by/${address}`)).data;
  }

  async getCommunities(): Promise<CommunityWithAuctions[]> {
    try {
      return (await axios.get(`${this.host}/communities`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommunity(contractAddress: string): Promise<CommunityWithAuctions> {
    try {
      return (await axios.get(`${this.host}/${contractAddress}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommunityWithId(id: number): Promise<Community> {
    try {
      return (await axios.get(`${this.host}/communities/id/${id}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }

  async getCommunityWithName(name: string): Promise<CommunityWithAuctions> {
    try {
      return (await axios.get(`${this.host}/communities/name/${name}`)).data;
    } catch (e: any) {
      throw e.response.data.message;
    }
  }
}
