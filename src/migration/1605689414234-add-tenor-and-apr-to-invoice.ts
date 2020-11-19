import {MigrationInterface, QueryRunner} from "typeorm";

export class addTenorAndAprToInvoice1605689414234 implements MigrationInterface {
    name = 'addTenorAndAprToInvoice1605689414234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` ADD `apr` decimal(12,2) NULL");
        await queryRunner.query("ALTER TABLE `invoice` ADD `tenor` decimal(12,2) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` DROP COLUMN `tenor`");
        await queryRunner.query("ALTER TABLE `invoice` DROP COLUMN `apr`");
    }

}
