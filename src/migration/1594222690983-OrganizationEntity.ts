import {MigrationInterface, QueryRunner} from "typeorm";

export class OrganizationEntity1594222690983 implements MigrationInterface {
    name = 'OrganizationEntity1594222690983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `organization` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` datetime NOT NULL, `createdBy` varchar(255) NULL, `updatedOn` datetime NULL, `updatedBy` varchar(255) NULL, `deletedBy` varchar(255) NULL, `name` varchar(255) NOT NULL, `code` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `address` varchar(255) NOT NULL, `phone` varchar(255) NOT NULL, `bankname` varchar(255) NOT NULL, `bankNumber` varchar(255) NOT NULL, `taxId` varchar(255) NOT NULL, `type` varchar(255) NOT NULL, UNIQUE INDEX `IDX_5d06de67ef6ab02cbd938988bb` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_5d06de67ef6ab02cbd938988bb` ON `organization`");
        await queryRunner.query("DROP TABLE `organization`");
    }

}
