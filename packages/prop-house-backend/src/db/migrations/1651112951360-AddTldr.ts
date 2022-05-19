import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTldr1651112951360 implements MigrationInterface {
    name = 'AddTldr1651112951360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposal" RENAME COLUMN "timeline" TO "tldr"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposal" RENAME COLUMN "tldr" TO "timeline"`);
    }

}
