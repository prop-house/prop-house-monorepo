import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPropAndVoteDescriptions1689964106451
  implements MigrationInterface
{
  name = 'AddPropAndVoteDescriptions1689964106451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "propStrategyDescription" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "voteStrategyDescription" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "voteStrategyDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" DROP COLUMN "propStrategyDescription"`,
    );
  }
}
