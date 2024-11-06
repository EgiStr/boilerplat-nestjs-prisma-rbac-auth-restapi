import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@prisma/client';
import { PrismaService } from 'src/common/databases/services/database.service';
import { ENUM_LOGGER_LEVEL } from 'src/common/logger/constants/logger.enum.constant';
import {
    LoggerCreateDto,
    LoggerCreateRawDto,
} from 'src/common/logger/dtos/logger.create.dto';
import { ILoggerService } from 'src/common/logger/interfaces/logger.service.interface';

@Injectable()
export class LoggerService implements ILoggerService {
    constructor(@Inject() private readonly prismaService: PrismaService) {}

    async info({
        action,
        description,
        user,
        method,
        requestId,
        role,
        accessFor,
        params,
        bodies,
        path,
        statusCode,
        tags,
    }: LoggerCreateDto): Promise<Logger> {
        let bodiesString = '';
        let paramsString = '';
        if (bodies instanceof Object) {
            bodiesString = JSON.stringify(bodies);
        }
        if (params instanceof Object) {
            paramsString = JSON.stringify(params);
        }
        const create = {
            level: ENUM_LOGGER_LEVEL.INFO,
            user,
            action,
            description,
            method,
            requestId,
            role,
            accessFor,
            params: paramsString,
            bodies: bodiesString,
            path,
            statusCode,
            tags,
        };

        return this.prismaService.logger.create({
            data: create,
        });
    }

    async debug({
        action,
        description,
        user,
        method,
        requestId,
        role,
        accessFor,
        params,
        bodies,
        path,
        statusCode,
        tags,
    }: LoggerCreateDto): Promise<Logger> {
        let bodiesString = '';
        let paramsString = '';

        if (bodies instanceof Object) {
            bodiesString = JSON.stringify(bodies);
        }
        if (params instanceof Object) {
            paramsString = JSON.stringify(params);
        }

        const create = {
            level: ENUM_LOGGER_LEVEL.DEBUG,
            user,
            action,
            description,
            method,
            requestId,
            role,
            accessFor,
            params: paramsString,
            bodies: bodiesString,
            path,
            statusCode,
            tags,
        };

        return this.prismaService.logger.create({
            data: create,
        });
    }

    async warn({
        action,
        description,
        user,
        method,
        requestId,
        role,
        accessFor,
        params,
        bodies,
        path,
        statusCode,
        tags,
    }: LoggerCreateDto): Promise<Logger> {
        let bodiesString = '';
        let paramsString = '';

        if (bodies instanceof Object) {
            bodiesString = JSON.stringify(bodies);
        }
        if (params instanceof Object) {
            paramsString = JSON.stringify(params);
        }

        const create = {
            level: ENUM_LOGGER_LEVEL.WARM,
            user,
            action,
            description,
            method,
            requestId,
            role,
            accessFor,
            params: paramsString,
            bodies: bodiesString,
            path,
            statusCode,
            tags,
        };

        return this.prismaService.logger.create({
            data: create,
        });
    }

    async fatal({
        action,
        description,
        user,
        method,
        requestId,
        role,
        accessFor,
        params,
        bodies,
        path,
        statusCode,
        tags,
    }: LoggerCreateDto): Promise<Logger> {
        let bodiesString = '';
        let paramsString = '';

        if (bodies instanceof Object) {
            bodiesString = JSON.stringify(bodies);
        }
        if (params instanceof Object) {
            paramsString = JSON.stringify(params);
        }
        const create = {
            level: ENUM_LOGGER_LEVEL.FATAL,
            user,
            action,
            description,
            method,
            requestId,
            role,
            accessFor,
            params: paramsString,
            bodies: bodiesString,
            path,
            statusCode,
            tags,
        };

        return this.prismaService.logger.create({
            data: create,
        });
    }

    async raw({
        level,
        action,
        description,
        user,
        method,
        requestId,
        role,
        accessFor,
        params,
        bodies,
        path,
        statusCode,
        tags,
    }: LoggerCreateRawDto): Promise<Logger> {
        let bodiesString = '';
        let paramsString = '';

        const create = {
            level,
            user,
            action,
            description,
            method,
            requestId,
            role,
            accessFor,
            params: paramsString,
            bodies: bodiesString,
            path,
            statusCode,
            tags,
        };

        return this.prismaService.logger.create({
            data: create,
        });
    }
}
