import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoteStrategy1689799390457 implements MigrationInterface {
  name = 'AddVoteStrategy1689799390457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auction" ADD "voteStrategy" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD "voteStrategy" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP COLUMN "voteStrategy"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "voteStrategy"`);
  }
}
