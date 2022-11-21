import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBlockHeightSetDefaultFundingAmount1668543942977 implements MigrationInterface {
    name = 'AddBlockHeightSetDefaultFundingAmount1668543942977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" ADD "blockHeight" integer`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "fundingAmount" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "fundingAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "blockHeight"`);
    }

}
