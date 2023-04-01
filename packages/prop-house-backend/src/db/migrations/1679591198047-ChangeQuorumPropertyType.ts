import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeQuorumPropertyType1679591198047
  implements MigrationInterface
{
  name = 'ChangeQuorumPropertyType1679591198047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ALTER COLUMN "quorum" TYPE integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ALTER COLUMN "quorum" TYPE numeric`,
    );
  }
}
