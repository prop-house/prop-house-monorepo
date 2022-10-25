import {MigrationInterface, QueryRunner} from "typeorm";

export class AddInfiniteRoundProperties1666716535359 implements MigrationInterface {
    name = 'AddInfiniteRoundProperties1666716535359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" RENAME COLUMN "auctionType" TO "type"`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "fundingAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "quorum" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "quorum" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "fundingAmount" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "auction" RENAME COLUMN "type" TO "auctionType"`);
    }

}
