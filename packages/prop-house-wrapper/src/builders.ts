import {
  Signer,
  TypedDataSigner,
  TypedDataField,
  TypedDataDomain,
} from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';
import { DomainSeparator } from './types/eip712Types';

export abstract class Signable {
  abstract toPayload(): any;

  async typedSignature(
    signer: Signer,
    domainSeparator: TypedDataDomain,
    eip712MessageType: Record<string, TypedDataField[]>,
  ) {
    const typedSigner = signer as Signer & TypedDataSigner;
    return await typedSigner._signTypedData(domainSeparator, eip712MessageType, this.toPayload());
  }

  async signedPayload(
    signer: Signer | Wallet,
    isContract: boolean,
    eip712MessageTypes?: Record<string, TypedDataField[]>,
  ) {
    const jsonPayload = this.jsonPayload();
    const address = await signer.getAddress();

    let signature: string | undefined;

    if (isContract) signature = await signer.signMessage(jsonPayload);
    if (eip712MessageTypes)
      signature = await this.typedSignature(signer, DomainSeparator, eip712MessageTypes);

    if (!signature) throw new Error(`Error signing payload.`);

    return {
      signedData: {
        message: Buffer.from(jsonPayload).toString('base64'),
        signature: signature,
        signer: address,
      },
      address,
      messageTypes: eip712MessageTypes,
      domainSeparator: DomainSeparator,
      ...this.toPayload(),
    };
  }

  /**
   * Signed payload with supplied signature
   */
  async presignedPayload(
    signer: Signer | Wallet,
    signature: string,
    jsonPayload?: string,
    eip712MessageTypes?: Record<string, TypedDataField[]>,
  ) {
    const address = await signer.getAddress();
    return {
      signedData: {
        message: Buffer.from(jsonPayload ? jsonPayload : this.jsonPayload()).toString('base64'),
        signature,
        signer: address,
      },
      address,
      messageTypes: eip712MessageTypes,
      domainSeparator: DomainSeparator,
      ...this.toPayload(),
    };
  }

  jsonPayload() {
    return JSON.stringify(this.toPayload());
  }
}

export class TimedAuction extends Signable {
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
    public readonly balanceBlockTag: number,
    public readonly description: string,
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
      balanceBlockTag: this.balanceBlockTag,
      description: this.description,
    };
  }
}

export class StoredTimedAuction extends TimedAuction {
  //@ts-ignore
  public readonly id: number;
  //@ts-ignore
  public readonly numProposals: number;
  //@ts-ignore
  public readonly createdDate: Date;

  static FromResponse(response: any): StoredTimedAuction {
    const parsed = {
      ...response,
      startTime: new Date(response.startTime),
      proposalEndTime: new Date(response.proposalEndTime),
      votingEndTime: new Date(response.votingEndTime),
    };
    return parsed;
  }
}

export class InfiniteAuction extends Signable {
  constructor(
    public readonly visible: boolean,
    public readonly title: string,
    public readonly startTime: Date,
    public readonly fundingAmount: number,
    public readonly currencyType: string,
    public readonly communityId: number,
    public readonly balanceBlockTag: number,
    public readonly description: string,
    public readonly quorum: number,
  ) {
    super();
  }

  toPayload() {
    return {
      visible: this.visible,
      title: this.title,
      startTime: this.startTime.toISOString(),
      fundingAmount: this.fundingAmount,
      currencyType: this.currencyType,
      communityId: this.communityId,
      balanceBlockTag: this.balanceBlockTag,
      description: this.description,
      quorum: this.quorum,
    };
  }
}

export class StoredInfiniteAuction extends InfiniteAuction {
  //@ts-ignore
  public readonly id: number;
  //@ts-ignore
  public readonly numProposals: number;
  //@ts-ignore
  public readonly createdDate: Date;

  static FromResponse(response: any): StoredTimedAuction {
    const parsed = {
      ...response,
      startTime: new Date(response.startTime),
    };
    return parsed;
  }
}

export type AuctionBase = TimedAuction | InfiniteAuction;
export type StoredAuctionBase = StoredTimedAuction | StoredInfiniteAuction;

export type ProposalParent = 'auction' | 'infinite-auction';

export class Proposal extends Signable {
  constructor(
    public readonly title: string,
    public readonly what: string,
    public readonly tldr: string,
    public readonly auctionId: number,
    public readonly parentType: ProposalParent = 'auction',
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      what: this.what,
      tldr: this.tldr,
      parentAuctionId: this.auctionId,
      parentType: this.parentType,
    };
  }
}

export class UpdatedProposal extends Proposal {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly what: string,
    public readonly tldr: string,
    public readonly auctionId: number,
    public readonly parentType: ProposalParent = 'auction',
  ) {
    super(title, what, tldr, auctionId, parentType);
  }

  toPayload() {
    return {
      id: this.id,
      ...super.toPayload(),
    };
  }
}

export class InfiniteAuctionProposal extends Signable {
  constructor(
    public readonly title: string,
    public readonly what: string,
    public readonly tldr: string,
    public readonly auctionId: number,
    public readonly reqAmount: number,
    public readonly parentType: ProposalParent = 'infinite-auction',
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      what: this.what,
      tldr: this.tldr,
      parentAuctionId: this.auctionId,
      parentType: this.parentType,
      reqAmount: this.reqAmount,
    };
  }
}

export interface StoredProposal extends Proposal {
  id: number;
  address: string;
  createdDate: Date;
  voteCount: number;
  lastUpdatedDate: Date;
  deletedAt: Date;
}

export interface StoredProposalWithVotes extends StoredProposal {
  votes: StoredVote[];
}

export class DeleteProposal extends Signable {
  constructor(public readonly id: number) {
    super();
  }

  toPayload() {
    return {
      id: this.id,
    };
  }
}

export enum Direction {
  Up = 1,
  Down = -1,
  Abstain = 0,
}

export enum SignatureState {
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  FAILED_VALIDATION = 'FAILED_VALIDATION',
  VALIDATED = 'VALIDATED',
}

export class Vote extends Signable {
  constructor(
    public readonly direction: Direction,
    public readonly proposalId: number,
    public readonly weight: number,
    public readonly communityAddress: string,
    public readonly signatureState: SignatureState,
    public readonly blockHeight: number,
  ) {
    super();
  }

  toPayload() {
    return {
      direction: this.direction,
      proposalId: this.proposalId,
      weight: this.weight,
      communityAddress: this.communityAddress,
      blockHeight: this.blockHeight,
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
    public readonly totalFunded: number,
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
      totalFunded: this.totalFunded,
      description: this.description,
    };
  }
}
export interface CommunityWithAuctions extends Community {
  auctions: StoredTimedAuction[];
}

export const signPayload = async (signer: Signer | Wallet, payload: string) =>
  await signer.signMessage(payload);
