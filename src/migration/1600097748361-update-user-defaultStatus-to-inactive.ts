import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUserDefaultStatusToInactive1600097748361 implements MigrationInterface {
    name = 'updateUserDefaultStatusToInactive1600097748361'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `status` `status` varchar(255) NOT NULL DEFAULT 'inactive'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `status` `status` varchar(255) NOT NULL DEFAULT 'active'");
    }

}
