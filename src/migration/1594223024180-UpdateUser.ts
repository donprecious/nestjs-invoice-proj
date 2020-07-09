import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1594223024180 implements MigrationInterface {
  name = 'UpdateUser1594223024180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user` ADD `isActive` tinyint NOT NULL DEFAULT 1',
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `createdOn` datetime NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `createdBy` varchar(255) NULL',
    );
    await queryRunner.query('ALTER TABLE `user` ADD `updatedOn` datetime NULL');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `updatedBy` varchar(255) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `user` ADD `deletedBy` varchar(255) NULL',
    );
    await queryRunner.query('ALTER TABLE `user` CHANGE `id` `id` int NOT NULL');
    await queryRunner.query('ALTER TABLE `user` DROP PRIMARY KEY');
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `id`');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `id` varchar(36) NOT NULL PRIMARY KEY',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `id`');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `id` int NOT NULL AUTO_INCREMENT',
    );
    await queryRunner.query('ALTER TABLE `user` ADD PRIMARY KEY (`id`)');
    await queryRunner.query(
      'ALTER TABLE `user` CHANGE `id` `id` int NOT NULL AUTO_INCREMENT',
    );
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `deletedBy`');
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `updatedBy`');
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `updatedOn`');
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `createdBy`');
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `createdOn`');
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `isActive`');
  }
}
