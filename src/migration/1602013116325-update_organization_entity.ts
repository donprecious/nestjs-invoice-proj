import {MigrationInterface, QueryRunner} from "typeorm";

export class updateOrganizationEntity1602013116325 implements MigrationInterface {
    name = 'updateOrganizationEntity1602013116325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `parentId`");
        await queryRunner.query("ALTER TABLE `organization` ADD `parentId` decimal(12,2) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `parentId`");
        await queryRunner.query("ALTER TABLE `organization` ADD `parentId` varchar(255) NULL");
    }

}
