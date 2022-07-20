import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCommunityDescription1658276278366 implements MigrationInterface {
    name = 'AddCommunityDescription1658276278366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "communityId"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "vote" ADD "weight" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auction" DROP CONSTRAINT "FK_57ed67d674d83b3e416123687e6"`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "communityId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auction" ADD CONSTRAINT "FK_57ed67d674d83b3e416123687e6" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" DROP CONSTRAINT "FK_57ed67d674d83b3e416123687e6"`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "communityId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auction" ADD CONSTRAINT "FK_57ed67d674d83b3e416123687e6" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "vote" ADD "weight" numeric NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "community" ADD "communityId" integer NOT NULL`);
    }

}
