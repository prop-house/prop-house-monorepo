import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForAndAgainstQuorums1684430109946
  implements MigrationInterface
{
  name = 'AddForAndAgainstQuorums1684430109946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" RENAME COLUMN "quorum" TO "quorumFor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD "quorumAgainst" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP COLUMN "quorumAgainst"`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" RENAME COLUMN "quorumFor" TO "quorum"`,
    );
  }
}
