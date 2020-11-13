import {MigrationInterface, QueryRunner} from "typeorm";

export class addedDaysPaidEarly1605173053487 implements MigrationInterface {
    name = 'addedDaysPaidEarly1605173053487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` ADD `daysPaidEarly` decimal(12,2) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invoice` DROP COLUMN `daysPaidEarly`");
    }

}
