import { ZodError } from 'zod';
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Optional,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { DebuggerService } from 'src/common/debugger/services/debugger.service';
import { IErrors } from 'src/common/error/interfaces/error.interface';
import { ErrorMetadataSerialization } from 'src/common/error/serializations/error.serialization';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import {
    IMessage,
    IMessageOptionsProperties,
} from 'src/common/message/interfaces/message.interface';
import { MessageService } from 'src/common/message/services/message.service';
import { IRequestApp } from 'src/common/request/interfaces/request.interface';

@Catch(ZodError)
export class ErrorZodFilter implements ExceptionFilter {
    private readonly appDefaultLanguage: string[];

    constructor(
        @Optional() private readonly debuggerService: DebuggerService,
        private readonly configService: ConfigService,
        private readonly messageService: MessageService,
        private readonly helperDateService: HelperDateService
    ) {
        this.appDefaultLanguage =
            this.configService.get<string[]>('app.language');
    }

    async catch(exception: ZodError, host: ArgumentsHost): Promise<void> {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: IRequestApp = ctx.getRequest<IRequestApp>();

        const __customLang: string[] =
            request.__customLang ?? this.appDefaultLanguage;
        const __requestId = request.__id || randomUUID();
        const __timestamp =
            request.__xTimestamp ??
            request.__timestamp ??
            this.helperDateService.timestamp();
        const __timezone =
            request.__timezone ??
            Intl.DateTimeFormat().resolvedOptions().timeZone;
        const __version =
            request.__version ??
            this.configService.get<string>('app.versioning.version');
        const __repoVersion =
            request.__repoVersion ??
            this.configService.get<string>('app.repoVersion');

        // Debugger
        try {
            this.debuggerService.error(
                request?.__id ? request.__id : ErrorZodFilter.name,
                {
                    description:
                        exception?.message ?? 'ErrorZodFilter catch exception',
                    class: ErrorZodFilter.name,
                    function: this.catch.name,
                    path: request.path,
                },
                exception
            );
        } catch (err: unknown) {}

        const statusHttp: HttpStatus = HttpStatus.BAD_REQUEST;
        const messagePath = `http.${statusHttp}`;
        const statusCode = HttpStatus.BAD_REQUEST;
        const errors: IErrors[] = exception.errors.map((error) => ({
            property: error.path.join('.'),
            message: error.message,
        }));
        const metadata: ErrorMetadataSerialization = {
            languages: __customLang,
            timestamp: __timestamp,
            timezone: __timezone,
            requestId: __requestId,
            path: request.path,
            version: __version,
            repoVersion: __repoVersion,
        };

        const message: string | IMessage = await this.messageService.get(
            messagePath,
            {
                customLanguages: __customLang,
            }
        );

        const responseBody = {
            statusCode,
            message,
            errors,
            _metadata: metadata,
        };

        response
            .setHeader('x-custom-lang', __customLang)
            .setHeader('x-timestamp', __timestamp)
            .setHeader('x-timezone', __timezone)
            .setHeader('x-request-id', __requestId)
            .setHeader('x-version', __version)
            .setHeader('x-repo-version', __repoVersion)
            .status(statusHttp)
            .json(responseBody);

        return;
    }
}
