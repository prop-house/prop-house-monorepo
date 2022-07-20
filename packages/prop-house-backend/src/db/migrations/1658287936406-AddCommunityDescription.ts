import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCommunityDescription1658287936406 implements MigrationInterface {
    name = 'AddCommunityDescription1658287936406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" ADD "description" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "description"`);
    }

}
