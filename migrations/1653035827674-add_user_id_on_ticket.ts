import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserIdOnTicket1653035827674 implements MigrationInterface {
    name = 'addUserIdOnTicket1653035827674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_0e01a7c92f008418bad6bad5919"`);
        await queryRunner.query(`ALTER TABLE "ticket" RENAME COLUMN "userId" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_368610dc3312f9b91e9ace40354" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_368610dc3312f9b91e9ace40354"`);
        await queryRunner.query(`ALTER TABLE "ticket" RENAME COLUMN "user_id" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_0e01a7c92f008418bad6bad5919" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
