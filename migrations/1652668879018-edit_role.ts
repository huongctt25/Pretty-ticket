import {MigrationInterface, QueryRunner} from "typeorm";

export class editRole1652668879018 implements MigrationInterface {
    name = 'editRole1652668879018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "role" TO "format"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "format"`);
        await queryRunner.query(`CREATE TYPE "public"."user_format_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "format" "public"."user_format_enum" NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "format"`);
        await queryRunner.query(`DROP TYPE "public"."user_format_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "format" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "format" TO "role"`);
    }

}
