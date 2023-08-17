import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Community } from '../community/community.entity';
import { Proposal } from '../proposal/proposal.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { AuctionBase } from './auction-base.type';
import {
  defaultProposingStrategy,
  defaultVotingStrategy,
} from '../utils/defaultStrategies';

@Entity()
@ObjectType()
export class Auction implements AuctionBase {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All auctions are issued a unique ID number',
  })
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => Date, {
    description: 'After the Start Time users may submit proposals',
  })
  startTime: Date;

  @Column()
  @Field(() => Date, {
    description: 'Users may submit proposals up until Proposal End Time',
  })
  proposalEndTime: Date;

  @Column()
  @Field(() => Date, {
    description:
      'Between Proposal End Time and Voting End Time, users may submit votes for proposals',
  })
  votingEndTime: Date;

  @Column({ type: 'decimal', scale: 2, default: 0.0 })
  @Field(() => Float, {
    description: 'The number of currency units paid to each winner',
  })
  fundingAmount: number;

  @Column({ nullable: true })
  @Field(() => String, {
    description: 'The currency for the auction that winners will be paid in',
  })
  currencyType: string;

  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  @Column()
  @Field(() => Int, {
    description: 'The number of winners that will be paid from the auction',
  })
  numWinners: number;

  @OneToMany(() => Proposal, (proposal) => proposal.auction)
  @JoinColumn()
  @Field(() => [Proposal])
  proposals: Proposal[];

  @RelationId((auction: Auction) => auction.proposals)
  proposalIds: number[];

  @ManyToOne(() => Community, (community) => community.auctions)
  @JoinColumn()
  @Field(() => Community)
  community: Community;

  @Column()
  @Field(() => Date)
  createdDate: Date;

  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @Column({ default: 0 })
  @Field(() => String)
  balanceBlockTag: number;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: defaultProposingStrategy,
  })
  @Field(() => String, {
    description: 'The strategy that defines who can propose',
  })
  propStrategy: any;

  @Column({ type: 'jsonb', nullable: false, default: defaultVotingStrategy })
  @Field(() => String, {
    description: 'The strategy that defines who can vote',
  })
  voteStrategy: any;

  @Column({ default: true })
  @Field(() => String, {
    description: 'Display or hide comments section',
  })
  displayComments: boolean;

  @Column({ nullable: true, default: null })
  @Field(() => String, {
    description: 'Describes who can propose',
  })
  propStrategyDescription: string;

  @Column({ nullable: true, default: null })
  @Field(() => String, {
    description: 'Describes who can vote',
  })
  voteStrategyDescription: string;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }

  public isAcceptingProposals = (): boolean =>
    new Date() > this.startTime && new Date() <= this.proposalEndTime;
}

@InputType()
export class AuctionInput extends Auction {}
