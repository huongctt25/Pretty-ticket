import {MigrationInterface, QueryRunner} from "typeorm";

export class Init1652429232618 implements MigrationInterface {
    name = 'Init1652429232618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "comment" character varying NOT NULL, "userId" integer, "ticketId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ticket" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "status" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_7522f1f6b36fa4b1742762a17f9" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_0e01a7c92f008418bad6bad5919" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_0e01a7c92f008418bad6bad5919"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_7522f1f6b36fa4b1742762a17f9"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_c0354a9a009d3bb45a08655ce3b"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`DROP TABLE "comment"`);
    }

}
