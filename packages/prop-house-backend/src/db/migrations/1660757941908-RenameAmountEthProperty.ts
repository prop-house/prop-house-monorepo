import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameAmountEthProperty1660757941908 implements MigrationInterface {
    name = 'RenameAmountEthProperty1660757941908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" RENAME COLUMN "amountEth" TO "fundingAmount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" RENAME COLUMN "fundingAmount" TO "amountEth"`);
    }

}
