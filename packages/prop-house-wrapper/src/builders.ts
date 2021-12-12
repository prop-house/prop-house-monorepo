import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";

export abstract class Signable {
  abstract toPayload(): any;

  async signedPayload(signer: Signer | Wallet) {
    const jsonPayload = this.jsonPayload();
		const address = await signer.getAddress()
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
    public readonly amountEth: number
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
      amountEth: this.amountEth,
    };
  }
}

export class Proposal extends Signable {
  constructor(
    public readonly title: string,
    public readonly body: string,
    public readonly auctionId: number
  ) {
    super();
  }

  toPayload() {
    return {
      title: this.title,
      body: this.body,
      parentAuctionId: this.auctionId,
    };
  }
}

export enum Direction {
  Up = 1,
  Down = -1,
}

export class Vote extends Signable {
  constructor(
    public readonly direction: Direction,
    public readonly proposalId: number
  ) {
    super();
  }

  toPayload() {
    return {
      direction: this.direction,
      proposalId: this.proposalId,
    };
  }
}
