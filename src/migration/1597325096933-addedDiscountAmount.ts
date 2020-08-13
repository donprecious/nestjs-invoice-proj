import {MigrationInterface, QueryRunner} from "typeorm";

export class addedDiscountAmount1597325096933 implements MigrationInterface {
    name = 'addedDiscountAmount1597325096933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` ADD `discountAmount` decimal NULL");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(10,0) NOT NULL");
        await queryRunner.query("ALTER TABLE `invoice` DROP COLUMN `discountAmount`");
    }

}
