import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateBaseEntityDateTime1594314370531 implements MigrationInterface {
    name = 'UpdateBaseEntityDateTime1594314370531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `updatedOn`");
        await queryRunner.query("ALTER TABLE `user` ADD `updatedOn` timestamp NULL");
        await queryRunner.query("ALTER TABLE `user_organization` DROP COLUMN `createdOn`");
        await queryRunner.query("ALTER TABLE `user_organization` ADD `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `user_organization` DROP COLUMN `updatedOn`");
        await queryRunner.query("ALTER TABLE `user_organization` ADD `updatedOn` timestamp NULL");
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `createdOn`");
        await queryRunner.query("ALTER TABLE `organization` ADD `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `updatedOn`");
        await queryRunner.query("ALTER TABLE `organization` ADD `updatedOn` timestamp NULL");
        await queryRunner.query("ALTER TABLE `organization_invite` DROP COLUMN `createdOn`");
        await queryRunner.query("ALTER TABLE `organization_invite` ADD `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP");
        await queryRunner.query("ALTER TABLE `organization_invite` DROP COLUMN `updatedOn`");
        await queryRunner.query("ALTER TABLE `organization_invite` ADD `updatedOn` timestamp NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization_invite` DROP COLUMN `updatedOn`");
        await queryRunner.query("ALTER TABLE `organization_invite` ADD `updatedOn` datetime NULL");
        await queryRunner.query("ALTER TABLE `organization_invite` DROP COLUMN `createdOn`");
        await queryRunner.query("ALTER TABLE `organization_invite` ADD `createdOn` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `updatedOn`");
        await queryRunner.query("ALTER TABLE `organization` ADD `updatedOn` datetime NULL");
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `createdOn`");
        await queryRunner.query("ALTER TABLE `organization` ADD `createdOn` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `user_organization` DROP COLUMN `updatedOn`");
        await queryRunner.query("ALTER TABLE `user_organization` ADD `updatedOn` datetime NULL");
        await queryRunner.query("ALTER TABLE `user_organization` DROP COLUMN `createdOn`");
        await queryRunner.query("ALTER TABLE `user_organization` ADD `createdOn` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `updatedOn`");
        await queryRunner.query("ALTER TABLE `user` ADD `updatedOn` datetime NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `createdOn`");
    }

}
