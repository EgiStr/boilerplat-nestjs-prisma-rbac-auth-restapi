import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ErrorHttpFilter } from './filters/error.http.filter';
import { ErrorMetaGuard } from './guards/error.meta.guard';
import { ErrorZodFilter } from './filters/error.zod.filter';

@Module({
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: ErrorHttpFilter,
        },
        {
            provide: APP_FILTER,
            useClass: ErrorZodFilter,
        },
        {
            provide: APP_GUARD,
            useClass: ErrorMetaGuard,
        },
    ],
    imports: [],
})
export class ErrorModule {}
