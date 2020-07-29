import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateAddressToJson1595738193476 implements MigrationInterface {
  name = 'updateAddressToJson1595738193476';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query("DROP INDEX `FK_5c00d7d515395f91bd1fee19f32` ON `invitation`");
    // await queryRunner.query("DROP INDEX `FK_05191060fae5b5485327709be7f` ON `invitation`");
    // await queryRunner.query("DROP INDEX `FK_a421da13b2fe31ed22805caa283` ON `invitation`");
    // await queryRunner.query("DROP INDEX `FK_8247d1dd8e24c71b25ee1fa48a6` ON `invoice`");
    // await queryRunner.query("DROP INDEX `FK_d6a2b8a401541eec50ee3464d47` ON `invoice`");
    await queryRunner.query(
      'ALTER TABLE `organization` DROP COLUMN `bankname`',
    );
    await queryRunner.query(
      'ALTER TABLE `organization` ADD `bankcode` varchar(255) NOT NULL',
    );
    await queryRunner.query('ALTER TABLE `organization` DROP COLUMN `address`');
    await queryRunner.query(
      'ALTER TABLE `organization` ADD `address` text NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `invoice` CHANGE `amount` `amount` decimal NOT NULL',
    );
    // await queryRunner.query("ALTER TABLE `invitation` ADD CONSTRAINT `FK_5c00d7d515395f91bd1fee19f32` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    // await queryRunner.query("ALTER TABLE `invitation` ADD CONSTRAINT `FK_05191060fae5b5485327709be7f` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    // await queryRunner.query("ALTER TABLE `invitation` ADD CONSTRAINT `FK_a421da13b2fe31ed22805caa283` FOREIGN KEY (`invitedByUserId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    // await queryRunner.query("ALTER TABLE `invoice` ADD CONSTRAINT `FK_8247d1dd8e24c71b25ee1fa48a6` FOREIGN KEY (`createdForOrganizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    // await queryRunner.query("ALTER TABLE `invoice` ADD CONSTRAINT `FK_d6a2b8a401541eec50ee3464d47` FOREIGN KEY (`createdByOrganizationId`) REFERENCES `organization`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query("ALTER TABLE `invoice` DROP FOREIGN KEY `FK_d6a2b8a401541eec50ee3464d47`");
    // await queryRunner.query("ALTER TABLE `invoice` DROP FOREIGN KEY `FK_8247d1dd8e24c71b25ee1fa48a6`");
    // await queryRunner.query("ALTER TABLE `invitation` DROP FOREIGN KEY `FK_a421da13b2fe31ed22805caa283`");
    // await queryRunner.query("ALTER TABLE `invitation` DROP FOREIGN KEY `FK_05191060fae5b5485327709be7f`");
    // await queryRunner.query("ALTER TABLE `invitation` DROP FOREIGN KEY `FK_5c00d7d515395f91bd1fee19f32`");
    await queryRunner.query(
      'ALTER TABLE `invoice` CHANGE `amount` `amount` decimal(10,0) NOT NULL',
    );
    await queryRunner.query('ALTER TABLE `organization` DROP COLUMN `address`');
    await queryRunner.query(
      'ALTER TABLE `organization` ADD `address` varchar(255) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `organization` DROP COLUMN `bankcode`',
    );
    await queryRunner.query(
      'ALTER TABLE `organization` ADD `bankname` varchar(255) NOT NULL',
    );
    // await queryRunner.query("CREATE INDEX `FK_d6a2b8a401541eec50ee3464d47` ON `invoice` (`createdByOrganizationId`)");
    // await queryRunner.query("CREATE INDEX `FK_8247d1dd8e24c71b25ee1fa48a6` ON `invoice` (`createdForOrganizationId`)");
    // await queryRunner.query("CREATE INDEX `FK_a421da13b2fe31ed22805caa283` ON `invitation` (`invitedByUserId`)");
    // await queryRunner.query("CREATE INDEX `FK_05191060fae5b5485327709be7f` ON `invitation` (`userId`)");
    // await queryRunner.query("CREATE INDEX `FK_5c00d7d515395f91bd1fee19f32` ON `invitation` (`organizationId`)");
  }
}
