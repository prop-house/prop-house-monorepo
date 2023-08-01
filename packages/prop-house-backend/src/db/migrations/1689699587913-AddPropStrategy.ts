import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropStrategy1689699587913 implements MigrationInterface {
  name = 'AddPropStrategy1689699587913';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "propStrategy" jsonb NOT NULL DEFAULT '{"num":1,"chainId":1,"strategyName":"fixedNum","blockTag":17737349}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD "propStrategy" jsonb NOT NULL DEFAULT '{"num":1,"chainId":1,"strategyName":"fixedNum","blockTag":17737349}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP COLUMN "propStrategy"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "propStrategy"`);
  }
}
