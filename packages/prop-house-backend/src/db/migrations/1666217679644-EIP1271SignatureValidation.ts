import { MigrationInterface, QueryRunner } from 'typeorm';

export class EIP1271SignatureValidation1666217679644
  implements MigrationInterface
{
  name = 'EIP1271SignatureValidation1666217679644';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vote" ADD "signatureState" character varying(60) NOT NULL DEFAULT 'VALIDATED'`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "signatureState" character varying(60) NOT NULL DEFAULT 'VALIDATED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP COLUMN "signatureState"`,
    );
    await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "signatureState"`);
  }
}
