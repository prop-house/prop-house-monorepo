import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuctionBalanceBlockTag1660868348372
  implements MigrationInterface
{
  name = 'AddAuctionBalanceBlockTag1660868348372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "balanceBlockTag" character varying NOT NULL DEFAULT 'latest'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "balanceBlockTag"`,
    );
  }
}
