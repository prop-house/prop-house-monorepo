import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameScoreProperty1663269786962 implements MigrationInterface {
  name = 'RenameScoreProperty1663269786962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" RENAME COLUMN "score" TO "voteCount"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" RENAME COLUMN "voteCount" TO "score"`,
    );
  }
}
