import {MigrationInterface, QueryRunner} from "typeorm";

export class addFileColumn1652844989117 implements MigrationInterface {
    name = 'addFileColumn1652844989117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" ADD "file" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN "file"`);
    }

}
