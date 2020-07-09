import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUser1594320758581 implements MigrationInterface {
    name = 'updateUser1594320758581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `phone` `phone` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `passwordHash` `passwordHash` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `otp` `otp` int NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `otpExpiresIn` `otpExpiresIn` datetime NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `otpExpiresIn` `otpExpiresIn` datetime NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `otp` `otp` int NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `passwordHash` `passwordHash` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `phone` `phone` varchar(255) NOT NULL");
    }

}
