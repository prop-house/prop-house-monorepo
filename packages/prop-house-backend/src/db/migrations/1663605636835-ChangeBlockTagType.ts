import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBlockTagType1663605636835 implements MigrationInterface {
  name = 'ChangeBlockTagType1663605636835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "balanceBlockTag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "balanceBlockTag" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "balanceBlockTag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "balanceBlockTag" character varying NOT NULL DEFAULT 'latest'`,
    );
  }
}
