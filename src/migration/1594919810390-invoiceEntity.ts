import {MigrationInterface, QueryRunner} from "typeorm";

export class invoiceEntity1594919810390 implements MigrationInterface {
    name = 'invoiceEntity1594919810390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `invoice` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `invoiceNumber` varchar(255) NOT NULL, `currencyCode` varchar(255) NOT NULL, `amount` decimal NOT NULL, `dueDate` timestamp NOT NULL, `createdForOrganizationId` varchar(36) NULL, `createdByOrganizationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `invoice` ADD CONSTRAINT `FK_8247d1dd8e24c71b25ee1fa48a6` FOREIGN KEY (`createdForOrganizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `invoice` ADD CONSTRAINT `FK_d6a2b8a401541eec50ee3464d47` FOREIGN KEY (`createdByOrganizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` DROP FOREIGN KEY `FK_d6a2b8a401541eec50ee3464d47`");
        await queryRunner.query("ALTER TABLE `invoice` DROP FOREIGN KEY `FK_8247d1dd8e24c71b25ee1fa48a6`");
        await queryRunner.query("DROP TABLE `invoice`");
    }

}
