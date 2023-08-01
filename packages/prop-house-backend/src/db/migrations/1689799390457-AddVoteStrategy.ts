import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoteStrategy1689799390457 implements MigrationInterface {
  name = 'AddVoteStrategy1689799390457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "voteStrategy" jsonb NOT NULL DEFAULT '{"num":1,"chainId":1,"strategyName":"fixedNum","blockTag":17737349}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD "voteStrategy" jsonb NOT NULL DEFAULT '{"num":1,"chainId":1,"strategyName":"fixedNum","blockTag":17737349}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP COLUMN "voteStrategy"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "voteStrategy"`);
  }
}
