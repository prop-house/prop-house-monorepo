import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuctionEventStatus1671684175546 implements MigrationInterface {
  name = 'AddAuctionEventStatus1671684175546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "eventStatus" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "eventStatus"`);
  }
}
