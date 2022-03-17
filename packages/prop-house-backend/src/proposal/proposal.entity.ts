import { Auction } from 'src/auction/auction.entity';
import { SignedEntity } from 'src/entities/signed.entity';
import { IndividualVoteWeights, VoteDirections } from 'src/utils/vote';
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
export class Proposal extends SignedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  title: string;

  @Column({ type: 'text' })
  who: string;

  @Column({ type: 'text' })
  what: string;

  @Column({ type: 'text' })
  timeline: string;

  @Column({ type: 'text' })
  links: string;

  @ManyToOne(() => Auction, (auction) => auction.proposals)
  @JoinColumn()
  auction: Auction;

  @RelationId((proposal: Proposal) => proposal.auction)
  @Column({ type: 'number' })
  auctionId: number;

  @OneToMany(() => Vote, (vote) => vote.proposal)
  @JoinColumn()
  votes: Vote[];

  @Column({ type: 'numeric', precision: 2, scale: 2, default: 0 })
  score: number;

  updateScore(voteWeights: IndividualVoteWeights) {
    this.score = this.votes.reduce((acc, v) => acc + voteWeights[v.type], 0);
  }

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
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
