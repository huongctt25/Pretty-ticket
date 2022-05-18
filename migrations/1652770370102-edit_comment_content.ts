import {MigrationInterface, QueryRunner} from "typeorm";

export class editCommentContent1652770370102 implements MigrationInterface {
    name = 'editCommentContent1652770370102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "comment" TO "content"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "content" TO "comment"`);
    }

}
