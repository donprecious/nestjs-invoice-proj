import {MigrationInterface, QueryRunner} from "typeorm";

export class addOrgRole1596724725797 implements MigrationInterface {
    name = 'addOrgRole1596724725797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `organization_role` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `roleId` varchar(36) NULL, `organizationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `organization_role` ADD CONSTRAINT `FK_a973dc09f3c97d0a5afec5020f8` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `organization_role` ADD CONSTRAINT `FK_d0089c004f5545d75bf696286aa` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization_role` DROP FOREIGN KEY `FK_d0089c004f5545d75bf696286aa`");
        await queryRunner.query("ALTER TABLE `organization_role` DROP FOREIGN KEY `FK_a973dc09f3c97d0a5afec5020f8`");
        await queryRunner.query("DROP TABLE `organization_role`");
    }

}
