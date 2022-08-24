import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAuctionDescription1660927829924 implements MigrationInterface {
    name = 'AddAuctionDescription1660927829924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ADD "description" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "description"`);
    }

}
