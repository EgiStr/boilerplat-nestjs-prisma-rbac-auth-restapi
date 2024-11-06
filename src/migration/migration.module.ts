import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { AuthModule } from 'src/common/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { SettingModule } from 'src/common/setting/setting.module';
import { MigrationPermissionSeed } from 'src/migration/seeds/migration.permission.seed';
import { MigrationRoleSeed } from 'src/migration/seeds/migration.role.seed';
import { MigrationSettingSeed } from 'src/migration/seeds/migration.setting.seed';
import { MigrationUserSeed } from 'src/migration/seeds/migration.user.seed';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { RoleModule } from 'src/modules/role/role.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    imports: [
        CommonModule,
        CommandModule,
        AuthModule,
        PermissionModule,
        UserModule,
        RoleModule,
        SettingModule,
    ],
    providers: [
        MigrationSettingSeed,
        MigrationPermissionSeed,
        MigrationRoleSeed,
        MigrationUserSeed,
    ],
    exports: [],
})
export class MigrationModule {}
