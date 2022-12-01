import {MigrationInterface, QueryRunner} from "typeorm";

export class FileAddressNullable1668120732694 implements MigrationInterface {
    name = 'FileAddressNullable1668120732694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "address" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" ALTER COLUMN "address" SET NOT NULL`);
    }

}
