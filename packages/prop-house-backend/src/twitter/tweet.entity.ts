import { EventStatus } from 'src/auction/types';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventName: EventStatus;

  @Column()
  parentEntity: string;

  @Column()
  parentEntityId: number;

  @Column()
  tweetId: string;

  @Column()
  createdDate: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }
}
