import {MigrationInterface, QueryRunner} from "typeorm";

export class addedStatusToUser1595752511420 implements MigrationInterface {
    name = 'addedStatusToUser1595752511420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `status` varchar(255) NOT NULL DEFAULT 'active'");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(10,0) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `status`");
    }

}
