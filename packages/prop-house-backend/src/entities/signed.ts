import { Address } from "src/types/address";
import { BaseEntity, Column, Entity } from "typeorm";

export abstract class SignedEntity extends BaseEntity {
  @Column()
  address: Address;

  @Column({ type: 'jsonb' })
  signedData: SignedDataPayload;
}

export interface SignedDataPayload {
	signature: string;
	message: string;
	signer: string;
}