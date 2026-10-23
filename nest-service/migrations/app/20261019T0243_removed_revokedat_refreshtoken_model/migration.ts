#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4d620c2b8484b3883ad6bac6b63342cde9317fac07011fa649646353ce0d40cf/contract';
import endContract from '../../snapshots/4d620c2b8484b3883ad6bac6b63342cde9317fac07011fa649646353ce0d40cf/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f4a43ad93fd68516b7a5a67e899f06950192d9fab42414c7a61853f0423eaa90/contract';
import startContract from '../../snapshots/f4a43ad93fd68516b7a5a67e899f06950192d9fab42414c7a61853f0423eaa90/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [this.dropColumn({ schema: 'public', table: 'RefreshToken', column: 'revokedAt' })];
  }
}

MigrationCLI.run(import.meta.url, M);
