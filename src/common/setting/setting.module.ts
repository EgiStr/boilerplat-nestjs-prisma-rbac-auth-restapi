import { Global, Module } from '@nestjs/common';
import { SettingMiddlewareModule } from 'src/common/setting/middleware/setting.middleware.module';
import { SettingService } from './services/setting.service';
import { DatabaseModule } from '../databases/database.module';

@Global()
@Module({
    imports: [SettingMiddlewareModule, DatabaseModule],
    exports: [SettingService],
    providers: [SettingService],
    controllers: [],
})
export class SettingModule {}
