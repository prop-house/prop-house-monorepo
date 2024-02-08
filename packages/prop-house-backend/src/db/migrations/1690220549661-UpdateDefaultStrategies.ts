import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDefaultStrategies1690220549661
  implements MigrationInterface
{
  name = 'UpdateDefaultStrategies1690220549661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "propStrategy" SET DEFAULT '{"num":1,"chainId":1,"strategyName":"fixedNum"}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "voteStrategy" SET DEFAULT '{"num":10,"chainId":1,"strategyName":"fixedNum"}'`,
    );

    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ALTER COLUMN "propStrategy" SET DEFAULT '{"num":1,"chainId":1,"strategyName":"fixedNum"}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ALTER COLUMN "voteStrategy" SET DEFAULT '{"num":10,"chainId":1,"strategyName":"fixedNum"}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ALTER COLUMN "voteStrategy" SET DEFAULT '{"num": 1, "chainId": 1, "blockTag": 17737349, "strategyName": "fixedNum"}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "infinite_auction" ALTER COLUMN "propStrategy" SET DEFAULT '{"num": 1, "chainId": 1, "blockTag": 17737349, "strategyName": "fixedNum"}'`,
    );

    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "voteStrategy" SET DEFAULT '{"num": 1, "chainId": 1, "blockTag": 17737349, "strategyName": "fixedNum"}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction" ALTER COLUMN "propStrategy" SET DEFAULT '{"num": 1, "chainId": 1, "blockTag": 17737349, "strategyName": "fixedNum"}'`,
    );
  }
}
