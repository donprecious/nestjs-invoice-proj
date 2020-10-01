import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { OkraController } from './okra/okra.controller';
import { OkraService } from './okra.service';

@Module({
    imports: [SharedModule],
    controllers: [OkraController],
    providers: [OkraService],
})
export class TransactionModule {}
