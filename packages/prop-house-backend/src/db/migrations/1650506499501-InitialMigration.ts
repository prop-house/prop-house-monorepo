import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1650506499501 implements MigrationInterface {
  name = 'InitialMigration1650506499501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vote" ("address" character varying NOT NULL, "signedData" jsonb NOT NULL, "id" SERIAL NOT NULL, "direction" integer NOT NULL DEFAULT '1', "createdDate" TIMESTAMP NOT NULL, "proposalId" integer NOT NULL, "auctionId" integer NOT NULL, "type" integer NOT NULL, "weight" numeric NOT NULL DEFAULT '1', CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "proposal" ("address" character varying NOT NULL, "signedData" jsonb NOT NULL, "id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "title" character varying NOT NULL, "who" text NOT NULL, "what" text NOT NULL, "timeline" text NOT NULL, "links" text NOT NULL, "auctionId" integer NOT NULL, "score" numeric NOT NULL DEFAULT '0', "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_ca872ecfe4fef5720d2d39e4275" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auction" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "title" character varying NOT NULL, "startTime" TIMESTAMP NOT NULL, "proposalEndTime" TIMESTAMP NOT NULL, "votingEndTime" TIMESTAMP NOT NULL, "amountEth" integer NOT NULL, "numWinners" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" SERIAL NOT NULL, "hidden" boolean NOT NULL DEFAULT false, "address" character varying NOT NULL, "name" character varying NOT NULL, "mimeType" character varying NOT NULL, "ipfsHash" character varying NOT NULL, "pinSize" integer NOT NULL, "ipfsTimestamp" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal" ADD CONSTRAINT "FK_4903e953d99225f0b6f9d5ad26f" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal" DROP CONSTRAINT "FK_4903e953d99225f0b6f9d5ad26f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1"`,
    );
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TABLE "auction"`);
    await queryRunner.query(`DROP TABLE "proposal"`);
    await queryRunner.query(`DROP TABLE "vote"`);
  }
}
