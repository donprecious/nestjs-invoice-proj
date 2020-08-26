import {MigrationInterface, QueryRunner} from "typeorm";

export class updateInvoiceAmountsDecimalValues1598473684408 implements MigrationInterface {
    name = 'updateInvoiceAmountsDecimalValues1598473684408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(12,2) NULL");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `discountAmount` `discountAmount` decimal(12,2) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `discountAmount` `discountAmount` decimal(8,2) NULL");
        await queryRunner.query("ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(8,2) NULL");
    }

}
