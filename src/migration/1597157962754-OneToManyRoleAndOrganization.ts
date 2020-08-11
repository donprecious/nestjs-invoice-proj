import {MigrationInterface, QueryRunner} from "typeorm";

export class OneToManyRoleAndOrganization1597157962754 implements MigrationInterface {
    name = 'OneToManyRoleAndOrganization1597157962754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `organizationId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `roleId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `organization` ADD `bankName` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `organization` CHANGE `bankcode` `bankcode` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `organization` CHANGE `bankNumber` `bankNumber` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_dfda472c0af7812401e592b6a61` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_c28e52f758e7bbc53828db92194` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_c28e52f758e7bbc53828db92194`");
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_dfda472c0af7812401e592b6a61`");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(10,0) NOT NULL");
        await queryRunner.query("ALTER TABLE `organization` CHANGE `bankNumber` `bankNumber` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `organization` CHANGE `bankcode` `bankcode` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `bankName`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `roleId`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `organizationId`");
    }

}
