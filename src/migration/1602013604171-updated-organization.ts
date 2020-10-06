import { MigrationInterface, QueryRunner } from 'typeorm';

export class updatedOrganization1602013604171 implements MigrationInterface {
  name = 'updatedOrganization1602013604171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ' ALTER TABLE `organization` CHANGE COLUMN `apr` `apr` DECIMAL(5,2) NULL DEFAULT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query("ALTER TABLE `organization` DROP COLUMN `apr`");
    await queryRunner.query('ALTER TABLE `organization` ADD `apr` int NULL');
  }
}
