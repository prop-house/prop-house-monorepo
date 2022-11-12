import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveVoteType1652930687797 implements MigrationInterface {
  name = 'RemoveVoteType1652930687797';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "type"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vote" ADD "type" integer NOT NULL`);
  }
}
