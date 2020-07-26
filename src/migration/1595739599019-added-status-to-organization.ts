import {MigrationInterface, QueryRunner} from "typeorm";

export class addedStatusToOrganization1595739599019 implements MigrationInterface {
    name = 'addedStatusToOrganization1595739599019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` ADD `status` varchar(255) NOT NULL DEFAULT 'active'");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(10,0) NOT NULL");
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `status`");
    }

}
