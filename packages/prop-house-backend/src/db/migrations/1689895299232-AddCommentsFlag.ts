import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentsFlag1689895299232 implements MigrationInterface {
  name = 'AddCommentsFlag1689895299232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "displayComments" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD "displayComments" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP COLUMN "displayComments"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "displayComments"`,
    );
  }
}
