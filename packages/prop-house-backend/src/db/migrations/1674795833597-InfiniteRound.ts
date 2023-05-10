import { MigrationInterface, QueryRunner } from 'typeorm';

export class InfiniteRound1674795833597 implements MigrationInterface {
  name = 'InfiniteRound1674795833597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP CONSTRAINT "FK_4903e953d99225f0b6f9d5ad26f"`,
    );
    await queryRunner.query(
      `CREATE TABLE "infinite_auction" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "title" character varying NOT NULL, "startTime" TIMESTAMP NOT NULL, "fundingAmount" numeric NOT NULL DEFAULT '0', "currencyType" character varying, "description" character varying, "quorum" numeric NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, "balanceBlockTag" integer NOT NULL DEFAULT '0', "communityId" integer, CONSTRAINT "PK_711d5aa843d603d67d58b325128" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "proposal" ADD "reqAmount" numeric`);
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD "parentType" character varying NOT NULL DEFAULT 'auction'`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ADD CONSTRAINT "FK_981f4a9d7e43d2b3a628b8fa5e2" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" DROP CONSTRAINT "FK_981f4a9d7e43d2b3a628b8fa5e2"`,
    );
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "parentType"`);
    await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "reqAmount"`);
    await queryRunner.query(`DROP TABLE "infinite_auction"`);
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD CONSTRAINT "FK_4903e953d99225f0b6f9d5ad26f" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
