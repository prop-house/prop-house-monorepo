import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTweetEntity1673462452668 implements MigrationInterface {
  name = 'AddTweetEntity1673462452668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tweet" ("id" SERIAL NOT NULL, "eventName" character varying NOT NULL, "parentEntity" character varying NOT NULL, "parentEntityId" integer NOT NULL, "tweetId" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_6dbf0db81305f2c096871a585f6" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tweet"`);
  }
}
