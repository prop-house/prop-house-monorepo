import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Auction } from 'src/auction/auction.entity';
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
} from 'typeorm';

@Entity()
@ObjectType()
export class Proposal extends SignedEntity {
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

  @ManyToOne(() => Auction, (auction) => auction.proposals)
  @JoinColumn()
  @Field(() => Auction)
  auction: Auction;

  @RelationId((proposal: Proposal) => proposal.auction)
  @Column({ type: 'number' })
  @Field(() => Int)
  auctionId: number;

  @OneToMany(() => Vote, (vote) => vote.proposal)
  @JoinColumn()
  @Field(() => [Vote])
  votes: Vote[];

  @Column({ type: 'numeric', default: 0 })
  @Field(() => Float)
  voteCount: number;

  @BeforeUpdate()
  updateVoteCount() {
    this.voteCount = this.votes.reduce((acc, vote) => {
      if (vote.signatureState !== SignatureState.VALIDATED) return;
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
}
