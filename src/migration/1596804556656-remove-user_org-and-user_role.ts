import {MigrationInterface, QueryRunner} from "typeorm";

export class removeUserOrgAndUserRole1596804556656 implements MigrationInterface {
    name = 'removeUserOrgAndUserRole1596804556656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `role` ADD `type` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal NOT NULL"); 

        await queryRunner.query("ALTER TABLE `user_organization` DROP FOREIGN KEY `FK_7143f31467178a6164a42426c15`");
        await queryRunner.query("ALTER TABLE `user_organization` DROP FOREIGN KEY `FK_29c3c8cc3ea9db22e4a347f4b5a`");
        await queryRunner.query("ALTER TABLE `user_role` DROP FOREIGN KEY `FK_dba55ed826ef26b5b22bd39409b`");
        await queryRunner.query("ALTER TABLE `user_role` DROP FOREIGN KEY `FK_ab40a6f0cd7d3ebfcce082131fd`");
        await queryRunner.query("DROP TABLE `user_role`");
        await queryRunner.query("DROP TABLE `user_organization`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(10,0) NOT NULL");
        await queryRunner.query("ALTER TABLE `role` DROP COLUMN `type`"); 

        await queryRunner.query("CREATE TABLE `user_role` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `userId` varchar(36) NULL, `roleId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_role` ADD CONSTRAINT `FK_ab40a6f0cd7d3ebfcce082131fd` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_role` ADD CONSTRAINT `FK_dba55ed826ef26b5b22bd39409b` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        
        await queryRunner.query("CREATE TABLE `user_organization` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `userId` varchar(36) NULL, `organizationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_organization` ADD CONSTRAINT `FK_29c3c8cc3ea9db22e4a347f4b5a` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_organization` ADD CONSTRAINT `FK_7143f31467178a6164a42426c15` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        
    }

}
