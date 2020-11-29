import {MigrationInterface, QueryRunner} from "typeorm";

export class updateInvoicechangeLogColumns1606560372364 implements MigrationInterface {
    name = 'updateInvoicechangeLogColumns1606560372364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice_change_log` DROP COLUMN `buyerCode`");
        await queryRunner.query("ALTER TABLE `invoice_change_log` ADD `buyerCode` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `invoice_change_log` DROP COLUMN `supplierCode`");
        await queryRunner.query("ALTER TABLE `invoice_change_log` ADD `supplierCode` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice_change_log` DROP COLUMN `supplierCode`");
        await queryRunner.query("ALTER TABLE `invoice_change_log` ADD `supplierCode` int NOT NULL");
        await queryRunner.query("ALTER TABLE `invoice_change_log` DROP COLUMN `buyerCode`");
        await queryRunner.query("ALTER TABLE `invoice_change_log` ADD `buyerCode` int NOT NULL");
    }

}
