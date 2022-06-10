import {MigrationInterface, QueryRunner} from "typeorm";

export class AddVoteWeight1654894873220 implements MigrationInterface {
    name = 'AddVoteWeight1654894873220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" ADD "weight" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "weight"`);
    }

}
