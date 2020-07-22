import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedInvitedByUserId1594410461500 implements MigrationInterface {
    name = 'AddedInvitedByUserId1594410461500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invitation` ADD `invitedByUserId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `invitation` ADD CONSTRAINT `FK_a421da13b2fe31ed22805caa283` FOREIGN KEY (`invitedByUserId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invitation` DROP FOREIGN KEY `FK_a421da13b2fe31ed22805caa283`");
        await queryRunner.query("ALTER TABLE `invitation` DROP COLUMN `invitedByUserId`");
    }

}
