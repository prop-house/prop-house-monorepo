import { Field, ObjectType } from "@nestjs/graphql";
import { Address } from "src/types/address";
import { BaseEntity, Column, Entity } from "typeorm";

@ObjectType()
export class SignedDataPayload {
  @Field(type => String)
	signature: string;

  @Field(type => String)
	message: string;

  @Field(type => String)
	signer: string;
}

@ObjectType()
export abstract class SignedEntity extends BaseEntity {
  @Column()
  @Field(type => String)
  address: Address;

  @Column({ type: 'jsonb' })
  @Field(type => SignedDataPayload)
  signedData: SignedDataPayload;
}
