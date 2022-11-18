import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer';
import { Wallet } from '@ethersproject/wallet';
import { EIP712Domain, EIP712MessageTypes } from './types/eip712Types';

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

export class StoredAuction extends Auction {
  //@ts-ignore
  public readonly id: number;
  //@ts-ignore
  public readonly numProposals: number;
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
    public readonly what: string,
    public readonly tldr: string,
    public readonly auctionId: number,
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      what: this.what,
      tldr: this.tldr,
      parentAuctionId: this.auctionId,
    };
  }
}

export interface StoredProposal extends Proposal {
  id: number;
  address: string;
  createdDate: Date;
  voteCount: number;
}

export interface StoredProposalWithVotes extends StoredProposal {
  votes: StoredVote[];
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

/**
 * Manages single vote submission with multi-vote signatures.
 *
 * To prevent users form signing each vote, we group together all votes and sign one payload.
 * This one signature is then used to submit each vote to the backend.
 */
export class SignableVotes extends Signable {
  constructor(public readonly votes: Vote[]) {
    super();
  }

  /**
   * The signed payload for a `vote` using a supplied signature
   */
  async presignedPayload(
    vote: Vote,
    signer: Signer | Wallet,
    jsonPayload: string,
    signature: string,
  ) {
    const address = await signer.getAddress();
    return {
      signedData: {
        message: Buffer.from(jsonPayload).toString('base64'),
        signature,
        signer: address,
      },
      address,
      ...vote.toPayload(),
    };
  }

  /**
   * Signature for payload of all votes
   */
  async multiVoteSignature(signer: Signer, isContract: boolean): Promise<string> {
    if (isContract) return await signer.signMessage(this.jsonPayload());

    const typedSigner = signer as Signer & TypedDataSigner;
    return await typedSigner._signTypedData(EIP712Domain, EIP712MessageTypes, this.toPayload());
  }

  /**
   * Payload for all votes
   */
  private allVotesPayload() {
    return {
      votes: this.votes.map(v => {
        return {
          ...v.toPayload(),
        };
      }),
    };
  }

  toPayload() {
    return this.allVotesPayload();
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
