import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVotingPeriod1678908041419 implements MigrationInterface {
  name = 'AddVotingPeriod1678908041419';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD "votingPeriod" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP COLUMN "votingPeriod"`,
    );
  }
}
