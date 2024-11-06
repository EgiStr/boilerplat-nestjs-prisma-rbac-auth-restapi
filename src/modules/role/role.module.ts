import { Module } from '@nestjs/common';
import { RoleService } from './services/role.service';
import { DatabaseModule } from 'src/common/databases/database.module';

@Module({
    controllers: [],
    providers: [RoleService],
    exports: [RoleService],
    imports: [DatabaseModule],
})
export class RoleModule {}
