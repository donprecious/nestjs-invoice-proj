import {MigrationInterface, QueryRunner} from "typeorm";

export class addedAprToOrganization1600758470730 implements MigrationInterface {
    name = 'addedAprToOrganization1600758470730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` ADD `apr` int NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `apr`");
    }

}
