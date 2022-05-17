import {MigrationInterface, QueryRunner} from "typeorm";

export class editTicketStatusEnum1652671388135 implements MigrationInterface {
    name = 'editTicketStatusEnum1652671388135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."ticket_status_enum" AS ENUM('pending', 'resolved', 'closed')`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD "status" "public"."ticket_status_enum" NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_status_enum"`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD "status" character varying NOT NULL`);
    }

}
