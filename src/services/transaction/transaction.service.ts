import { Injectable } from '@nestjs/common';
import { BankTransactions } from 'src/entities/banktransaction.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
export class TransactionService {}

@EntityRepository(BankTransactions)
export class BankTransactionRepository extends Repository<BankTransactions> {}
