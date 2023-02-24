import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypedSigProperties1671986415902 implements MigrationInterface {
  name = 'AddTypedSigProperties1671986415902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vote" ADD "domainSeparator" jsonb`);
    await queryRunner.query(`ALTER TABLE "vote" ADD "messageTypes" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "messageTypes"`);
    await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "domainSeparator"`);
  }
}
