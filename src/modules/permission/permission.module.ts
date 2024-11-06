import { Module } from '@nestjs/common';
import { PermissionService } from './services/permission.service';
import { DatabaseModule } from 'src/common/databases/database.module';

@Module({
    controllers: [],
    providers: [PermissionService],
    exports: [PermissionService],
    imports: [DatabaseModule],
})
export class PermissionModule {}
