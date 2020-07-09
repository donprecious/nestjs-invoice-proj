import {MigrationInterface, QueryRunner} from "typeorm";

export class UserOrganization1594224424325 implements MigrationInterface {
    name = 'UserOrganization1594224424325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user_organization` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` datetime NOT NULL, `createdBy` varchar(255) NULL, `updatedOn` datetime NULL, `updatedBy` varchar(255) NULL, `deletedBy` varchar(255) NULL, `userId` varchar(36) NULL, `organizationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user_organization` ADD CONSTRAINT `FK_29c3c8cc3ea9db22e4a347f4b5a` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_organization` ADD CONSTRAINT `FK_7143f31467178a6164a42426c15` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_organization` DROP FOREIGN KEY `FK_7143f31467178a6164a42426c15`");
        await queryRunner.query("ALTER TABLE `user_organization` DROP FOREIGN KEY `FK_29c3c8cc3ea9db22e4a347f4b5a`");
        await queryRunner.query("DROP TABLE `user_organization`");
    }

}
