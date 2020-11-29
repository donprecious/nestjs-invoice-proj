import {MigrationInterface, QueryRunner} from "typeorm";

export class addedInvoiceChangeLog1606404335755 implements MigrationInterface {
    name = 'addedInvoiceChangeLog1606404335755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `invoice_change_log` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `invoiceId` varchar(255) NOT NULL, `invoiceNumber` varchar(255) NOT NULL, `changeYear` int NOT NULL, `changeMonth` int NOT NULL, `changeWeekInYear` int NOT NULL, `invoiceAmount` decimal(12,2) NULL, `discountAmount` decimal(12,2) NULL, `changeAmount` decimal(12,2) NULL, `buyerCode` int NOT NULL, `supplierCode` int NOT NULL, `statusFrom` varchar(255) NOT NULL, `statusTo` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `invoice_change_log` ADD CONSTRAINT `FK_44c3c27edb5605357506cd0d7d5` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice_change_log` DROP FOREIGN KEY `FK_44c3c27edb5605357506cd0d7d5`");
        await queryRunner.query("DROP TABLE `invoice_change_log`");
    }

}
