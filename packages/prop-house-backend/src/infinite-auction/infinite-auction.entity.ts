import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { AuctionBase } from '../auction/auction-base.type';
import { Community } from '../community/community.entity';
import { InfiniteAuctionProposal } from '../proposal/infauction-proposal.entity';
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
import { isProposalFunded, sumAmountRequested } from './utils';
import {
  defaultProposingStrategy,
  defaultVotingStrategy,
} from '../utils/defaultStrategies';

@Entity()
@ObjectType()
export class InfiniteAuction implements AuctionBase {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All infinite auctions are issued a unique ID number',
  })
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => Date, {
    description: 'Once the start time has passed, proposals may be submitted',
  })
  startTime: Date;

  @Column({ type: 'decimal', scale: 2, default: 0.0 })
  @Field(() => Float, {
    description: 'The number of currency units that will be paid out in total',
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

  @Column({ type: 'integer', default: 0 })
  @Field(() => Int, {
    description: 'The minimum vote count that a proposal must have to pass',
  })
  quorumFor: number;

  @Column({ type: 'integer', default: 0 })
  @Field(() => Int, {
    description:
      'The minimum vote count that a proposal must have to be rejected',
  })
  quorumAgainst: number;

  @Column({ type: 'jsonb', nullable: false, default: defaultProposingStrategy })
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

  @OneToMany(() => InfiniteAuctionProposal, (proposal) => proposal.auction)
  @JoinColumn()
  @Field(() => [InfiniteAuctionProposal])
  proposals: InfiniteAuctionProposal[];

  @RelationId((infAuction: InfiniteAuction) => infAuction.proposals)
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

  @Column({ default: 0 })
  @Field(() => Number)
  votingPeriod: number;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }

  isAcceptingProposals = () => this.startTime <= new Date();

  /**
   * Get the proposals that have been funded
   */
  fundedProposals = async () =>
    (await this.proposals).filter(isProposalFunded(this.quorumFor));

  /**
   * Get the number of proposals that have been funded
   */
  propsFunded = async () => (await this.fundedProposals()).length;

  /**
   * Calculate the amount of currency that has been funded.
   */
  fundingUsed = async () => sumAmountRequested(await this.fundedProposals());
}

@InputType()
export class InfiniteAuctionInput extends InfiniteAuction {}
