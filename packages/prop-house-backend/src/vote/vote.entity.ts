import { SignedEntity } from 'src/entities/signed';
import { Proposal } from 'src/proposal/proposal.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
} from 'typeorm';

@Entity()
export class Vote extends SignedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  direction: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.votes)
  @JoinColumn()
  proposal: Proposal;

  @Column()
  createdDate: Date;

  @Column()
  proposalId: number;

  @Column()
  auctionId: number;

  @Column()
  type: number;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }
}
