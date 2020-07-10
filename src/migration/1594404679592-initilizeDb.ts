import {MigrationInterface, QueryRunner} from "typeorm";

export class initilizeDb1594404679592 implements MigrationInterface {
    name = 'initilizeDb1594404679592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `role` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `Name` varchar(255) NOT NULL, `Description` varchar(255) NULL, `permission` text NOT NULL, UNIQUE INDEX `IDX_65aaedd70b9d60594dddcc36b2` (`Name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_role` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `userId` varchar(36) NULL, `roleId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `phone` varchar(255) NULL, `passwordHash` varchar(255) NULL, `otp` int NULL, `otpExpiresIn` datetime NULL, UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_organization` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `userId` varchar(36) NULL, `organizationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `organization` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `name` varchar(255) NOT NULL, `code` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `address` varchar(255) NOT NULL, `phone` varchar(255) NOT NULL, `bankname` varchar(255) NOT NULL, `bankNumber` varchar(255) NOT NULL, `taxId` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `organization_invite` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `invitedByOrganizationId` varchar(36) NULL, `inviteeOrganizationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_role` ADD CONSTRAINT `FK_ab40a6f0cd7d3ebfcce082131fd` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_role` ADD CONSTRAINT `FK_dba55ed826ef26b5b22bd39409b` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_organization` ADD CONSTRAINT `FK_29c3c8cc3ea9db22e4a347f4b5a` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_organization` ADD CONSTRAINT `FK_7143f31467178a6164a42426c15` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `organization_invite` ADD CONSTRAINT `FK_0d63749c646fa4f47a2bd5dd5e8` FOREIGN KEY (`invitedByOrganizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `organization_invite` ADD CONSTRAINT `FK_3155c4b42521b75fdf2ca82c218` FOREIGN KEY (`inviteeOrganizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization_invite` DROP FOREIGN KEY `FK_3155c4b42521b75fdf2ca82c218`");
        await queryRunner.query("ALTER TABLE `organization_invite` DROP FOREIGN KEY `FK_0d63749c646fa4f47a2bd5dd5e8`");
        await queryRunner.query("ALTER TABLE `user_organization` DROP FOREIGN KEY `FK_7143f31467178a6164a42426c15`");
        await queryRunner.query("ALTER TABLE `user_organization` DROP FOREIGN KEY `FK_29c3c8cc3ea9db22e4a347f4b5a`");
        await queryRunner.query("ALTER TABLE `user_role` DROP FOREIGN KEY `FK_dba55ed826ef26b5b22bd39409b`");
        await queryRunner.query("ALTER TABLE `user_role` DROP FOREIGN KEY `FK_ab40a6f0cd7d3ebfcce082131fd`");
        await queryRunner.query("DROP TABLE `organization_invite`");
        await queryRunner.query("DROP TABLE `organization`");
        await queryRunner.query("DROP TABLE `user_organization`");
        await queryRunner.query("DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP TABLE `user_role`");
        await queryRunner.query("DROP INDEX `IDX_65aaedd70b9d60594dddcc36b2` ON `role`");
        await queryRunner.query("DROP TABLE `role`");
    }

}
