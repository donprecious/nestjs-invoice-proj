import {MigrationInterface, QueryRunner} from "typeorm";

export class OrganizationInvitee1594224988617 implements MigrationInterface {
    name = 'OrganizationInvitee1594224988617'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `organization_invite` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` datetime NOT NULL, `createdBy` varchar(255) NULL, `updatedOn` datetime NULL, `updatedBy` varchar(255) NULL, `deletedBy` varchar(255) NULL, `invitedByOrganizationId` varchar(36) NULL, `inviteeOrganizationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `organization_invite` ADD CONSTRAINT `FK_0d63749c646fa4f47a2bd5dd5e8` FOREIGN KEY (`invitedByOrganizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `organization_invite` ADD CONSTRAINT `FK_3155c4b42521b75fdf2ca82c218` FOREIGN KEY (`inviteeOrganizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization_invite` DROP FOREIGN KEY `FK_3155c4b42521b75fdf2ca82c218`");
        await queryRunner.query("ALTER TABLE `organization_invite` DROP FOREIGN KEY `FK_0d63749c646fa4f47a2bd5dd5e8`");
        await queryRunner.query("DROP TABLE `organization_invite`");
    }

}
