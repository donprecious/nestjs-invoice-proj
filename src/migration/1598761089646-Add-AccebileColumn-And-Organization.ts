import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAccebileColumnAndOrganization1598761089646 implements MigrationInterface {
    name = 'AddAccebileColumnAndOrganization1598761089646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `role` ADD `accessiblilty` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `role` ADD `organizationId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `role` ADD CONSTRAINT `FK_2bcd50772082305f3bcee6b6da4` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `role` DROP FOREIGN KEY `FK_2bcd50772082305f3bcee6b6da4`");
        await queryRunner.query("ALTER TABLE `role` DROP COLUMN `organizationId`");
        await queryRunner.query("ALTER TABLE `role` DROP COLUMN `accessiblilty`");
    }

}
