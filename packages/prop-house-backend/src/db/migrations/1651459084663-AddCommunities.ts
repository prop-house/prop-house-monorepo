import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommunities1651459084663 implements MigrationInterface {
  name = 'AddCommunities1651459084663';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "community" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "contractAddress" character varying NOT NULL, "name" character varying NOT NULL, "profileImageUrl" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "auction" ADD "communityId" integer`);
    await queryRunner.query(
      `ALTER TABLE "auction" ADD CONSTRAINT "FK_57ed67d674d83b3e416123687e6" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" DROP CONSTRAINT "FK_57ed67d674d83b3e416123687e6"`,
    );
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "communityId"`);
    await queryRunner.query(`DROP TABLE "community"`);
  }
}
