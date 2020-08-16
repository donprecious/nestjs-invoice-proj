import {MigrationInterface, QueryRunner} from "typeorm";

export class organizationParentId1597460999639 implements MigrationInterface {
    name = 'organizationParentId1597460999639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` ADD `parentId` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `parentId`");
    }

}
