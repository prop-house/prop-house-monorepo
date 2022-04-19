import { Proposal } from 'src/proposal/proposal.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  RelationCount,
} from 'typeorm';

@Entity()
export class Community {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({default: true})
  visible: boolean;

  @Column()
  contractAddress: string;

  @Column()
  name: string;

  @Column()
  profileImageUrl: string;

  // TODO: refactor to not use deprecated decorator
  @RelationCount((community: Community) => community.proposals)
  numProposals: number;

  @Column()
  numRounds: number;

  @Column()
  amountEthFunded: number;

  @OneToMany(() => Proposal, (proposal) => proposal.community, {
    eager: true,
  })
  @JoinColumn()
  proposals: Proposal[];

  @Column()
  createdDate: Date;

  @Column({nullable: true})
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
