#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/53a8eebc5ddf0401008af9d164c13bee92e264629b22508069ec01b3636f77f4/contract';
import startContract from '../../snapshots/53a8eebc5ddf0401008af9d164c13bee92e264629b22508069ec01b3636f77f4/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f4a43ad93fd68516b7a5a67e899f06950192d9fab42414c7a61853f0423eaa90/contract';
import endContract from '../../snapshots/f4a43ad93fd68516b7a5a67e899f06950192d9fab42414c7a61853f0423eaa90/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      ...this.renameColumn({
        schema: 'public',
        table: 'RefreshToken',
        column: 'token',
        to: 'hashedToken',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
