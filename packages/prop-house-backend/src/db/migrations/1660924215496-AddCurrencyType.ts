import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrencyType1660924215496 implements MigrationInterface {
  name = 'AddCurrencyType1660924215496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "currencyType" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "currencyType"`);
  }
}
