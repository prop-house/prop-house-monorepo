import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProposalProperties1663268696481
  implements MigrationInterface
{
  name = 'RemoveProposalProperties1663268696481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "who"`);
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "links"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" ADD "links" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "proposal" ADD "who" text NOT NULL`);
  }
}
