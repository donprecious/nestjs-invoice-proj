import {MigrationInterface, QueryRunner} from "typeorm";

export class addedStatusToInvoice1600715496702 implements MigrationInterface {
    name = 'addedStatusToInvoice1600715496702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` ADD `status` varchar(255) NULL DEFAULT 'pending'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` DROP COLUMN `status`");
    }

}
