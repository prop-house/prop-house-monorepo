import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Auction } from 'src/auction/auction.entity';
import { SignedEntity } from 'src/entities/signed';
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
  @Field(type => Int)
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  @Field(type => String)
  title: string;

  @Column({ type: 'text' })
  @Field(type => String)
  what: string;

  @Column({ type: 'text' })
  @Field(type => String)
  tldr: string;

  @ManyToOne(() => Auction, (auction) => auction.proposals)
  @JoinColumn()
  @Field(type => Auction)
  auction: Auction;

  @RelationId((proposal: Proposal) => proposal.auction)
  @Column({ type: 'number' })
  @Field(type => Int)
  auctionId: number;

  @OneToMany(() => Vote, (vote) => vote.proposal)
  @JoinColumn()
  @Field(type => [Vote])
  votes: Vote[];

  @Column({ type: 'numeric', default: 0 })
  @Field(type => Float)
  voteCount: number;

  @BeforeUpdate()
  updateVoteCount() {
    this.voteCount = this.votes.reduce((acc, vote) => {
      return Number(acc) + Number(vote.weight);
    }, 0);
  }

  @Column()
  @Field(type => Date)
  createdDate: Date;

  @Column({ nullable: true })
  @Field(type => Date)
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
