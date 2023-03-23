import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePropertyType1679589360168 implements MigrationInterface {
  name = 'ChangePropertyType1679589360168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" ALTER COLUMN "voteCount" TYPE integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" ALTER COLUMN "voteCount" TYPE numeric`,
    );
  }
}
