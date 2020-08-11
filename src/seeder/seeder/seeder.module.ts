import { SharedModule } from './../../modules/shared/shared.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Module({
  imports: [SharedModule],
  providers: [SeederService],
})
export class SeederModule implements OnModuleInit {
  constructor(private seederService: SeederService) {}
  async onModuleInit() {
    await this.seederService.seed();
  }
}
