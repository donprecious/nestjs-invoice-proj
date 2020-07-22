import { MigrationInterface, QueryRunner } from 'typeorm';

export class invitation1594409823793 implements MigrationInterface {
  name = 'invitation1594409823793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `invitation` (`id` varchar(36) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `createdBy` varchar(255) NULL, `updatedOn` timestamp NULL, `updatedBy` varchar(255) NULL, `deletedOn` timestamp NULL, `deletedBy` varchar(255) NULL, `confirmationType` varchar(255) NOT NULL, `status` varchar(255) NULL, `organizationId` varchar(36) NULL, `userId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `invitation` ADD CONSTRAINT `FK_5c00d7d515395f91bd1fee19f32` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `invitation` ADD CONSTRAINT `FK_05191060fae5b5485327709be7f` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `invitation` DROP FOREIGN KEY `FK_05191060fae5b5485327709be7f`',
    );
    await queryRunner.query(
      'ALTER TABLE `invitation` DROP FOREIGN KEY `FK_5c00d7d515395f91bd1fee19f32`',
    );
    await queryRunner.query('DROP TABLE `invitation`');
  }
}
