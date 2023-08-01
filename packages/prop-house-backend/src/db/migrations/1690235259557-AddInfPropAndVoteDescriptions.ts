import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInfPropAndVoteDescriptions1690235259557
  implements MigrationInterface
{
  name = 'AddInfPropAndVoteDescriptions1690235259557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD "propStrategyDescription" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD "voteStrategyDescription" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP COLUMN "voteStrategyDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP COLUMN "propStrategyDescription"`,
    );
  }
}
