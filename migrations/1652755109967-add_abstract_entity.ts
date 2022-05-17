import {MigrationInterface, QueryRunner} from "typeorm";

export class addAbstractEntity1652755109967 implements MigrationInterface {
    name = 'addAbstractEntity1652755109967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "createdAt"`);
    }

}
