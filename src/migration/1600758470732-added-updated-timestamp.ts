import {MigrationInterface, QueryRunner} from "typeorm";

export class addedUpdatedTimestamp1600758470732 implements MigrationInterface {
    name = 'addedUpdatedTimestamp1600758470732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(" ALTER TABLE `organization` CHANGE `updatedOn` `updatedOn` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ");

        await queryRunner.query(" ALTER TABLE `invoice` CHANGE `updatedOn` `updatedOn` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ");

        await queryRunner.query(" ALTER TABLE `user` CHANGE `updatedOn` `updatedOn` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ");

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `apr`");
    }

}
