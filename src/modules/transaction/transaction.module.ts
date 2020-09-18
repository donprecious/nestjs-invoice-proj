import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { OkraController } from './okra/okra.controller';

@Module({
    imports: [SharedModule],
    controllers: [OkraController],
})
export class TransactionModule {}
