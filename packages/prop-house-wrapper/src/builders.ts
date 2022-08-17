import { Signer } from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';

export abstract class Signable {
  abstract toPayload(): any;

  async signedPayload(signer: Signer | Wallet) {
    const jsonPayload = this.jsonPayload();
    const address = await signer.getAddress();
    return {
      signedData: {
        message: Buffer.from(jsonPayload).toString('base64'),
        signature: await signer.signMessage(jsonPayload),
        signer: address,
      },
      address,
      ...this.toPayload(),
    };
  }

  async presignedPayload(signer: Signer | Wallet, jsonPayload: string, signature: string) {
    const address = await signer.getAddress();
    return {
      signedData: {
        message: Buffer.from(jsonPayload).toString('base64'),
        signature,
        signer: address,
      },
      address,
      ...this.toPayload(),
    };
  }

  jsonPayload() {
    return JSON.stringify(this.toPayload());
  }
}

export class Auction extends Signable {
  constructor(
    public readonly visible: boolean,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly proposalEndTime: Date,
    public readonly votingEndTime: Date,
    public readonly fundingAmount: number,
    public readonly currencyType: string,
    public readonly numWinners: number,
    public readonly community: number,
  ) {
    super();
  }

  toPayload() {
    return {
      visible: this.visible,
      title: this.title,
      startTime: this.startTime.toISOString(),
      proposalEndTime: this.proposalEndTime.toISOString(),
      votingEndTime: this.votingEndTime.toISOString(),
      fundingAmount: this.fundingAmount,
      currencyType: this.currencyType,
      numWinners: this.numWinners,
      community: this.community,
    };
  }
}

export class StoredAuction extends Auction {
  //@ts-ignore
  public readonly id: number;
  //@ts-ignore
  public readonly proposals: StoredProposal[];
  //@ts-ignore
  public readonly createdDate: Date;

  static FromResponse(response: any): StoredAuction {
    const parsed = {
      ...response,
      startTime: new Date(response.startTime),
      proposalEndTime: new Date(response.proposalEndTime),
      votingEndTime: new Date(response.votingEndTime),
    };
    return parsed;
  }
}

export class Proposal extends Signable {
  constructor(
    public readonly title: string,
    public readonly who: string,
    public readonly what: string,
    public readonly tldr: string,
    public readonly links: string,
    public readonly auctionId: number,
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      who: this.who,
      what: this.what,
      tldr: this.tldr,
      links: this.links,
      parentAuctionId: this.auctionId,
    };
  }
}

export interface StoredProposal extends Proposal {
  id: number;
  address: string;
  createdDate: Date;
  score: number;
}

export interface StoredProposalWithVotes extends StoredProposal {
  votes: StoredVote[];
}

export enum Direction {
  Up = 1,
  Down = -1,
  Abstain = 0,
}

export class Vote extends Signable {
  constructor(
    public readonly direction: Direction,
    public readonly proposalId: number,
    public readonly weight: number,
    public readonly communityAddress: string,
  ) {
    super();
  }

  toPayload() {
    return {
      direction: this.direction,
      proposalId: this.proposalId,
      weight: this.weight,
      communityAddress: this.communityAddress,
    };
  }
}

export interface StoredVote extends Vote {
  address: string;
  signedData: string;
  id: number;
}

export interface StoredFile {
  id: number;
  hidden: boolean;
  address: string;
  name: string;
  mimeType: string;
  ipfsHash: string;
  pinSize: string;
  ipfsTimestamp: string;
  createdDate: string;
}

export class Community extends Signable {
  constructor(
    public readonly id: number,
    public readonly contractAddress: string,
    public readonly name: string,
    public readonly profileImageUrl: string,
    public readonly numAuctions: number,
    public readonly numProposals: number,
    public readonly ethFunded: number,
    public readonly description: number,
  ) {
    super();
  }

  toPayload() {
    return {
      id: this.id,
      contractAddress: this.contractAddress,
      name: this.name,
      profileImageUrl: this.profileImageUrl,
      numAuctions: this.numAuctions,
      numProposals: this.numProposals,
      ethFunded: this.ethFunded,
      description: this.description,
    };
  }
}
export interface CommunityWithAuctions extends Community {
  auctions: StoredAuction[];
}

export const signPayload = async (signer: Signer | Wallet, payload: string) =>
  await signer.signMessage(payload);
