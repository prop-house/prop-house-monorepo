import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { SignedEntity } from '../entities/signed';
import { SignatureState } from '../types/signature';
import { Vote } from '../vote/vote.entity';
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
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';

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
  voteCountFor: number;

  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  voteCountAgainst: number;

  @BeforeUpdate()
  updateVoteCount() {
    this.voteCountFor = this.votes.reduce((acc, vote) => {
      if (vote.signatureState !== SignatureState.VALIDATED) return acc;
      if (vote.direction !== Direction.Up) return acc;
      return Number(acc) + Number(vote.weight);
    }, 0);
    this.voteCountAgainst = this.votes.reduce((acc, vote) => {
      if (vote.signatureState !== SignatureState.VALIDATED) return acc;
      if (vote.direction !== Direction.Down) return acc;
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
