import {MigrationInterface, QueryRunner} from "typeorm";

export class ResetPasswordTokenInUser1594756946793 implements MigrationInterface {
    name = 'ResetPasswordTokenInUser1594756946793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `resetPasswordToken` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `resetPasswordTokenExpire` timestamp NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `resetPasswordTokenExpire`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `resetPasswordToken`");
    }

}
