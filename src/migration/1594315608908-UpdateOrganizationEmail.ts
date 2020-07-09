import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateOrganizationEmail1594315608908 implements MigrationInterface {
    name = 'UpdateOrganizationEmail1594315608908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_5d06de67ef6ab02cbd938988bb` ON `organization`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_5d06de67ef6ab02cbd938988bb` ON `organization` (`email`)");
    }

}
