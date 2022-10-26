import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFundingAmountPropertyType1666111078154
  implements MigrationInterface
{
  name = 'UpdateFundingAmountPropertyType1666111078154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "fundingAmount" TYPE numeric`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "fundingAmount" TYPE numeric(2,0)`,
    );
  }
}
