import { Community } from 'src/community/community.entity';
import { Proposal } from 'src/proposal/proposal.entity';
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

@Entity()
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  title: string;

  @Column()
  startTime: Date;

  @Column()
  proposalEndTime: Date;

  @Column()
  votingEndTime: Date;

  @Column()
  fundingAmount: number;

  @Column({ nullable: true })
  currencyType: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  numWinners: number;

  @OneToMany(() => Proposal, (proposal) => proposal.auction)
  @JoinColumn()
  proposals: Proposal[];

  @RelationId((auction: Auction) => auction.proposals)
  numProposals: number;

  @ManyToOne(() => Community, (community) => community.auctions)
  @JoinColumn()
  community: Community;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  lastUpdatedDate: Date;

  @Column({ default: 0 })
  balanceBlockTag: number;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }
}
