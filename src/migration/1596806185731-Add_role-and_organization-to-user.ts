import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRoleAndOrganizationToUser1596806185731 implements MigrationInterface {
    name = 'AddRoleAndOrganizationToUser1596806185731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `organizationId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `user` ADD UNIQUE INDEX `IDX_dfda472c0af7812401e592b6a6` (`organizationId`)");
        await queryRunner.query("ALTER TABLE `user` ADD `roleId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `user` ADD UNIQUE INDEX `IDX_c28e52f758e7bbc53828db9219` (`roleId`)");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_dfda472c0af7812401e592b6a6` ON `user` (`organizationId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_c28e52f758e7bbc53828db9219` ON `user` (`roleId`)");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_dfda472c0af7812401e592b6a61` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_c28e52f758e7bbc53828db92194` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_c28e52f758e7bbc53828db92194`");
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_dfda472c0af7812401e592b6a61`");
        await queryRunner.query("DROP INDEX `REL_c28e52f758e7bbc53828db9219` ON `user`");
        await queryRunner.query("DROP INDEX `REL_dfda472c0af7812401e592b6a6` ON `user`");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(10,0) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP INDEX `IDX_c28e52f758e7bbc53828db9219`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `roleId`");
        await queryRunner.query("ALTER TABLE `user` DROP INDEX `IDX_dfda472c0af7812401e592b6a6`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `organizationId`");
    }

}
