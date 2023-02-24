import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypedSigPropertiesProposal1671990572435
  implements MigrationInterface
{
  name = 'AddTypedSigPropertiesProposal1671990572435';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "domainSeparator" jsonb`,
    );
    await queryRunner.query(`ALTER TABLE "proposal" ADD "messageTypes" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP COLUMN "messageTypes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP COLUMN "domainSeparator"`,
    );
  }
}
