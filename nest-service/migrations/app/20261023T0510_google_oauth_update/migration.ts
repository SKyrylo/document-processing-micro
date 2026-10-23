#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/4d620c2b8484b3883ad6bac6b63342cde9317fac07011fa649646353ce0d40cf/contract';
import startContract from '../../snapshots/4d620c2b8484b3883ad6bac6b63342cde9317fac07011fa649646353ce0d40cf/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9b2b9d2b30683d39d040d171a826570da4fdc961df9909982cb5cedf2c82003f/contract';
import endContract from '../../snapshots/9b2b9d2b30683d39d040d171a826570da4fdc961df9909982cb5cedf2c82003f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Account',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('provider', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('providerAccountId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.dropNotNull({ schema: 'public', table: 'User', column: 'password' }),
      this.addUnique({
        schema: 'public',
        table: 'Account',
        constraint: 'Account_provider_providerAccountId_key',
        columns: ['provider', 'providerAccountId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Account',
        index: 'Account_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Account',
        foreignKey: {
          name: 'Account_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
