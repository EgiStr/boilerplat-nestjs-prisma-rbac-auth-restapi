import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DebuggerModule } from 'src/common/debugger/debugger.module';
import { HelperModule } from 'src/common/helper/helper.module';
import { ErrorModule } from 'src/common/error/error.module';
import { ResponseModule } from 'src/common/response/response.module';
import { RequestModule } from 'src/common/request/request.module';
import { MessageModule } from 'src/common/message/message.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import configs from 'src/configs';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './databases/database.module';

@Global()
@Module({
    controllers: [],
    providers: [],
    imports: [
        ConfigModule.forRoot({
            load: configs,
            isGlobal: true,
            cache: true,
            envFilePath: ['.env'],
            expandVariables: true,
            validationOptions: {
                allowUnknown: true,
                abortEarly: true,
            },
        }),
        DatabaseModule,
        HelperModule,
        MessageModule,
        LoggerModule,
        PaginationModule,
        DebuggerModule,
        ErrorModule,
        ResponseModule,
        RequestModule,
        AuthModule,
    ],
})
export class CommonModule {}
