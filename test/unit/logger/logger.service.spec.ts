import { faker } from '@faker-js/faker';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Logger } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';

import { HelperModule } from 'src/common/helper/helper.module';
import {
    ENUM_LOGGER_ACTION,
    ENUM_LOGGER_LEVEL,
} from 'src/common/logger/constants/logger.enum.constant';
import { LoggerCreateDto } from 'src/common/logger/dtos/logger.create.dto';
import { LoggerModule } from 'src/common/logger/logger.module';
import { LoggerService } from 'src/common/logger/services/logger.service';
import { ENUM_REQUEST_METHOD } from 'src/common/request/constants/request.enum.constant';
import configs from 'src/configs';

describe('LoggerService', () => {
    let loggerService: LoggerService;

    const loggerLevel: ENUM_LOGGER_LEVEL = ENUM_LOGGER_LEVEL.INFO;
    const logger: LoggerCreateDto = {
        action: ENUM_LOGGER_ACTION.TEST,
        description: 'test aaa',
        method: ENUM_REQUEST_METHOD.GET,
        tags: [],
        path: '/path',
    };

    const loggerComplete: LoggerCreateDto = {
        action: ENUM_LOGGER_ACTION.TEST,
        description: 'test aaa',
        user: randomUUID(),
        requestId: randomUUID(),
        role: randomUUID(),
        accessFor: ENUM_AUTH_ACCESS_FOR.SUPER_ADMIN,
        method: ENUM_REQUEST_METHOD.GET,
        statusCode: 10000,
        bodies: {
            test: 'aaa',
        },
        params: {
            test: 'bbb',
        },
        path: '/path-complete',
        tags: [],
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: configs,
                    isGlobal: true,
                    cache: true,
                    envFilePath: ['.env'],
                    expandVariables: true,
                }),
                HelperModule,
                LoggerModule,
            ],
        }).compile();

        loggerService = moduleRef.get<LoggerService>(LoggerService);
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(loggerService).toBeDefined();
    });

    describe('info', () => {
        it('should be success', async () => {
            const result: Logger = await loggerService.info(logger);

            jest.spyOn(loggerService, 'info').mockReturnValueOnce(
                result as any
            );

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(ENUM_LOGGER_LEVEL.INFO);
        });

        it('with complete data', async () => {
            const result: Logger = await loggerService.info(loggerComplete);

            jest.spyOn(loggerService, 'info').mockReturnValueOnce(
                result as any
            );

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(ENUM_LOGGER_LEVEL.INFO);
        });
    });

    describe('debug', () => {
        it('should be success', async () => {
            const result: Logger = await loggerService.debug(logger);

            jest.spyOn(loggerService, 'debug').mockReturnValueOnce(
                result as any
            );

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(ENUM_LOGGER_LEVEL.DEBUG);
        });

        it('with complete data', async () => {
            const result: Logger = await loggerService.debug(loggerComplete);

            jest.spyOn(loggerService, 'debug').mockReturnValueOnce(
                result as any
            );

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(ENUM_LOGGER_LEVEL.DEBUG);
        });
    });

    describe('warning', () => {
        it('should be success', async () => {
            const result: Logger = await loggerService.warn(logger);

            jest.spyOn(loggerService, 'warn').mockReturnValueOnce(
                result as any
            );

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(ENUM_LOGGER_LEVEL.WARM);
        });

        it('with complete data', async () => {
            const result: Logger = await loggerService.warn(loggerComplete);

            jest.spyOn(loggerService, 'warn').mockReturnValueOnce(
                result as any
            );

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(ENUM_LOGGER_LEVEL.WARM);
        });
    });

    describe('fatal', () => {
        it('should be success', async () => {
            const result: Logger = await loggerService.fatal(logger);

            jest.spyOn(loggerService, 'fatal').mockReturnValueOnce(
                result as any
            );

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(ENUM_LOGGER_LEVEL.FATAL);
        });

        it('with complete data', async () => {
            const result: Logger = await loggerService.fatal(loggerComplete);

            jest.spyOn(loggerService, 'fatal').mockReturnValueOnce(
                result as any
            );

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(ENUM_LOGGER_LEVEL.FATAL);
        });
    });

    describe('raw', () => {
        it('should be success', async () => {
            const result: Logger = await loggerService.raw({
                level: loggerLevel,
                ...logger,
            });

            jest.spyOn(loggerService, 'raw').mockReturnValueOnce(result as any);

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(loggerLevel);
        });

        it('should be success complete', async () => {
            const result: Logger = await loggerService.raw({
                level: loggerLevel,
                ...loggerComplete,
            });

            jest.spyOn(loggerService, 'raw').mockReturnValueOnce(result as any);

            expect(result).toBeTruthy();
            expect(result.id).toBeDefined();
            expect(result.level).toBe(loggerLevel);
        });
    });
});
