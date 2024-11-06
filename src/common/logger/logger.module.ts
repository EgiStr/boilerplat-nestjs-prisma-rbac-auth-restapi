import { Global, Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { DatabaseModule } from '../databases/database.module';

@Global()
@Module({
    providers: [LoggerService],
    exports: [LoggerService],
    imports: [DatabaseModule],
})
export class LoggerModule {}
