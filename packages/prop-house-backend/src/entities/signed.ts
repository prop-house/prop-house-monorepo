import { Field, ObjectType } from '@nestjs/graphql';
import { IsEthereumAddress } from 'class-validator';
import { Address } from '../types/address';
import { SignatureState } from '../types/signature';
import { BaseEntity, Column } from 'typeorm';
import { EIP712MessageType } from '../types/eip712MessageType';
import { TypedDataDomain } from '@ethersproject/abstract-signer';
import { BytesLike } from '@ethersproject/bytes';

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
class TypedDataDomainGql {
  @Field(() => String)
  name?: string;
  @Field(() => String)
  version?: string;
  @Field(() => String)
  chainId?: string;
  @Field(() => String)
  verifyingContract?: string;
  @Field(() => [String])
  salt?: BytesLike;
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
  @Field(() => TypedDataDomainGql)
  domainSeparator: TypedDataDomain;

  @Column({ type: 'jsonb', default: null })
  @Field(() => String)
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
