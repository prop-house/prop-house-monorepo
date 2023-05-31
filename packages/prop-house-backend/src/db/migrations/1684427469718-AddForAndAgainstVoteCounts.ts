import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForAndAgainstVoteCounts1684427469718
  implements MigrationInterface
{
  name = 'AddForAndAgainstVoteCounts1684427469718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" RENAME COLUMN "voteCount" TO "voteCountFor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "voteCountAgainst" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP COLUMN "voteCountAgainst"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" RENAME COLUMN "voteCountFor" TO "voteCount"`,
    );
  }
}
