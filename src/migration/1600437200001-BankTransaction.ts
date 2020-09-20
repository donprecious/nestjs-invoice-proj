import {MigrationInterface, QueryRunner} from "typeorm";

export class BankTransaction1600437200001 implements MigrationInterface {
    name = 'BankTransaction1600437200001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `bank_transactions` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `recordId` varchar(255) NOT NULL, `provider` varchar(255) NOT NULL, `recordType` varchar(255) NOT NULL, `data` text NOT NULL, `organizationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `bank_transactions` ADD CONSTRAINT `FK_8d3e42c76006efc1048699b9e94` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `bank_transactions` DROP FOREIGN KEY `FK_8d3e42c76006efc1048699b9e94`");
        await queryRunner.query("DROP TABLE `bank_transactions`");
    }

}
