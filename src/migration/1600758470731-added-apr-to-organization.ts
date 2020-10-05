import {MigrationInterface, QueryRunner} from "typeorm";

export class addedAprToOrganization1600758470731 implements MigrationInterface {
    name = 'addedAprToOrganization1600758470731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(" ALTER TABLE `organization` CHANGE COLUMN `apr` `apr` DECIMAL(5,2) NULL DEFAULT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `apr`");
    }

}
