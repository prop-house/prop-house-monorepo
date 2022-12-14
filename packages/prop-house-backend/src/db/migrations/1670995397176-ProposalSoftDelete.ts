import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProposalSoftDelete1670995397176 implements MigrationInterface {
  name = 'ProposalSoftDelete1670995397176';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" ADD "deletedAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "deletedAt"`);
  }
}
