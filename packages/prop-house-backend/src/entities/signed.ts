import { Field, ObjectType } from '@nestjs/graphql';
import { IsEthereumAddress } from 'class-validator';
import { Address } from 'src/types/address';
import { SignatureState } from 'src/types/signature';
import { BaseEntity, Column } from 'typeorm';
import { EIP712MessageType } from 'src/types/eip712MessageType';
import { TypedDataDomain } from '@ethersproject/abstract-signer';

@ObjectType()
export class SignedDataPayload {
  @Field(() => String)
  signature: string;

  @Field(() => String)
  message: string;

  @Field(() => String)
  signer: string;
}

@ObjectType()
export abstract class SignedEntity extends BaseEntity {
  @Column()
  @IsEthereumAddress()
  @Field(() => String)
  address: Address;

  @Column('varchar', {
    length: 60,
    nullable: false,
    default: SignatureState.VALIDATED,
  })
  @Field(() => String)
  signatureState: SignatureState;

  @Column({ type: 'jsonb' })
  @Field(() => SignedDataPayload)
  signedData: SignedDataPayload;

  @Column({ type: 'jsonb', default: null })
  // @Field(() => ???)
  domainSeparator: TypedDataDomain;

  @Column({ type: 'jsonb', default: null })
  // @Field(() => ???)
  messageTypes: EIP712MessageType;

  constructor(opts?: Partial<SignedEntity>) {
    super();
    if (opts) {
      this.address = opts.address;
      this.signatureState = opts.signatureState;
      this.signedData = opts.signedData;
    }
  }
}
