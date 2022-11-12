import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIsWinnerProperty1663269044101 implements MigrationInterface {
  name = 'RemoveIsWinnerProperty1663269044101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "isWinner"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "isWinner" boolean NOT NULL DEFAULT false`,
    );
  }
}
