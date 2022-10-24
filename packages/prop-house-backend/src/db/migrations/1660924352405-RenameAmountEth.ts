import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAmountEth1660924352405 implements MigrationInterface {
  name = 'RenameAmountEth1660924352405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" RENAME COLUMN "amountEth" TO "fundingAmount"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" RENAME COLUMN "fundingAmount" TO "amountEth"`,
    );
  }
}
