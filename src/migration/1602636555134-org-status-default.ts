import {MigrationInterface, QueryRunner} from "typeorm";

export class orgStatusDefault1602636555134 implements MigrationInterface {
    name = 'orgStatusDefault1602636555134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` CHANGE `status` `status` varchar(255) NOT NULL DEFAULT 'inactive'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `organization` CHANGE `status` `status` varchar(255) NOT NULL DEFAULT 'active'");
    }

}
