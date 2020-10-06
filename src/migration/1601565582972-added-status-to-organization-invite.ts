import { MigrationInterface, QueryRunner } from 'typeorm';

export class addedStatusToOrganizationInvite1601565582972
  implements MigrationInterface {
  name = 'addedStatusToOrganizationInvite1601565582972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `organization_invite` ADD `status` varchar(255) NOT NULL DEFAULT 'pending'",
    );
    await queryRunner.query(
      'ALTER TABLE `user` CHANGE `updatedOn` `updatedOn` timestamp NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `organization` CHANGE `updatedOn` `updatedOn` timestamp NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `invoice` CHANGE `updatedOn` `updatedOn` timestamp NULL',
    );
    await queryRunner.query(
      "ALTER TABLE `invoice` CHANGE `status` `status` varchar(255) NULL DEFAULT 'accepted'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `invoice` CHANGE `status` `status` varchar(255) NULL DEFAULT 'pending'",
    );
    await queryRunner.query(
      'ALTER TABLE `invoice` CHANGE `updatedOn` `updatedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    );

    await queryRunner.query(
      'ALTER TABLE `organization` CHANGE `updatedOn` `updatedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    );
    await queryRunner.query(
      'ALTER TABLE `user` CHANGE `updatedOn` `updatedOn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    );
    await queryRunner.query(
      'ALTER TABLE `organization_invite` DROP COLUMN `status`',
    );
  }
}
