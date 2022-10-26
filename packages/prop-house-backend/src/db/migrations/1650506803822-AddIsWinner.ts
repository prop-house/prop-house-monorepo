import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsWinner1650506803822 implements MigrationInterface {
  name = 'AddIsWinner1650506803822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "isWinner" boolean NOT NULL DEFAULT 'false'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "isWinner"`);
  }
}
