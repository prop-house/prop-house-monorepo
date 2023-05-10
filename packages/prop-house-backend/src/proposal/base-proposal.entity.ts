import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { SignedEntity } from 'src/entities/signed';
import { SignatureState } from 'src/types/signature';
import { Vote } from 'src/vote/vote.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
  BeforeUpdate,
  BeforeInsert,
  RelationId,
  DeleteDateColumn,
} from 'typeorm';
import { ProposalParent } from './proposal.types';

@ObjectType()
export abstract class BaseProposal extends SignedEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  @Field(() => String)
  title: string;

  @Column({ type: 'text' })
  @Field(() => String)
  what: string;

  @Column({ type: 'text' })
  @Field(() => String)
  tldr: string;

  // AuctionID exists on entities with relations
  @Column()
  auctionId: number;

  @OneToMany(() => Vote, (vote) => vote.proposal)
  @JoinColumn()
  @Field(() => [Vote])
  votes: Vote[];

  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  voteCount: number;

  @BeforeUpdate()
  updateVoteCount() {
    this.voteCount = this.votes.reduce((acc, vote) => {
      if (vote.signatureState !== SignatureState.VALIDATED) return acc;
      return Number(acc) + Number(vote.weight);
    }, 0);
  }

  @Column()
  @Field(() => Date)
  createdDate: Date;

  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true, type: 'numeric' })
  @Field(() => Float, {
    description:
      'The number of currency-units the proposal is requesting (for infinite rounds)',
  })
  reqAmount: number;

  @Column({ default: 'auction' as ProposalParent })
  @Field(() => String)
  parentType: ProposalParent;
}
