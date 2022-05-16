import {MigrationInterface, QueryRunner} from "typeorm";

export class editRole21652669612827 implements MigrationInterface {
    name = 'editRole21652669612827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "format" TO "role"`);
        await queryRunner.query(`ALTER TYPE "public"."user_format_enum" RENAME TO "user_role_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_format_enum"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "role" TO "format"`);
    }

}
