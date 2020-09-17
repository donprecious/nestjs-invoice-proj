import {MigrationInterface, QueryRunner} from "typeorm";

export class invitationExpiresTime1600093167465 implements MigrationInterface {
    name = 'invitationExpiresTime1600093167465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invitation` ADD `ExpiresIn` timestamp NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invitation` DROP COLUMN `ExpiresIn`");
    }

}
