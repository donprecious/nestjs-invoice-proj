import { BankTransactions } from 'src/entities/banktransaction.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(BankTransactions)
export class BankTransactionRepository extends Repository<BankTransactions> {}
