import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCurrencyType1660753545669 implements MigrationInterface {
    name = 'AddCurrencyType1660753545669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "currencyType" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "currencyType" DROP NOT NULL`);
    }

}
