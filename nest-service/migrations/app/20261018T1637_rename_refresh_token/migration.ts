#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/53a8eebc5ddf0401008af9d164c13bee92e264629b22508069ec01b3636f77f4/contract';
import endContract from '../../snapshots/53a8eebc5ddf0401008af9d164c13bee92e264629b22508069ec01b3636f77f4/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/9d7c86a045401568ff9090eb8b6497fe92f4769b3824fe32654df8db92c68bb9/contract';
import startContract from '../../snapshots/9d7c86a045401568ff9090eb8b6497fe92f4769b3824fe32654df8db92c68bb9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      ...this.renameColumn({
        schema: 'public',
        table: 'RefreshToken',
        column: 'tokenHash',
        to: 'token',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
