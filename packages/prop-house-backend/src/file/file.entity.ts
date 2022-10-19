import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  hidden: boolean;

  @Column()
  address: string;

  @Column()
  name: string;

  @Column()
  mimeType: string;

  @Column()
  ipfsHash: string;

  @Column()
  pinSize: number;

  @Column()
  ipfsTimestamp: string;

  @Column()
  createdDate: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }
}
