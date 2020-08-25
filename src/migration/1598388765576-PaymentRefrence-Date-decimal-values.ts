import {MigrationInterface, QueryRunner} from "typeorm";

export class PaymentRefrenceDateDecimalValues1598388765576 implements MigrationInterface {
    name = 'PaymentRefrenceDateDecimalValues1598388765576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` ADD `paymentReference` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `invoice` ADD `paymentDate` timestamp NULL");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(8,2) NULL");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `discountAmount` `discountAmount` decimal(8,2) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `discountAmount` `discountAmount` decimal(10,0) NULL");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(10,0) NOT NULL");
        await queryRunner.query("ALTER TABLE `invoice` DROP COLUMN `paymentDate`");
        await queryRunner.query("ALTER TABLE `invoice` DROP COLUMN `paymentReference`");
    }

}
