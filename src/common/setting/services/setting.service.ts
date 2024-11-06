import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Setting } from '@prisma/client';
import {
    IDatabaseCreateOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseManyOptions,
    IDatabaseOptions,
} from 'src/common/databases/interfaces/database.interface';
import { PrismaService } from 'src/common/databases/services/database.service';

import { HelperNumberService } from 'src/common/helper/services/helper.number.service';
import { ENUM_SETTING_DATA_TYPE } from 'src/common/setting/constants/setting.enum.constant';
import { SettingCreateDto } from 'src/common/setting/dtos/setting.create.dto';
import { SettingUpdateValueDto } from 'src/common/setting/dtos/setting.update-value.dto';
import { ISettingService } from 'src/common/setting/interfaces/setting.service.interface';

@Injectable()
export class SettingService implements ISettingService {
    private readonly mobileNumberCountryCodeAllowed: string[];
    private readonly passwordAttempt: boolean;
    private readonly maxPasswordAttempt: number;

    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
        private readonly helperNumberService: HelperNumberService
    ) {
        this.mobileNumberCountryCodeAllowed = this.configService.get<string[]>(
            'user.mobileNumberCountryCodeAllowed'
        );
        this.passwordAttempt = this.configService.get<boolean>(
            'auth.password.attempt'
        );
        this.maxPasswordAttempt = this.configService.get<number>(
            'auth.password.maxAttempt'
        );
    }

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<Setting[]> {
        return this.prismaService.setting.findMany({
            where: find,
            ...options,
        });
    }

    async findOneById(id: string, options?: any): Promise<Setting> {
        return this.prismaService.setting.findUnique({
            where: { id },
            ...options,
        });
    }

    async findOneByName(name: string, options?: any): Promise<Setting> {
        return this.prismaService.setting.findUnique({
            where: { name },
            ...options,
        });
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number> {
        return this.prismaService.setting.count({
            where: find,
            ...options,
        });
    }

    async create(
        { name, description, type, value }: SettingCreateDto,
        options?: any
    ): Promise<Setting> {
        return this.prismaService.setting.create({
            data: {
                name,
                description,
                type,
                value,
            },
            ...options,
        });
    }

    async updateValue(
        id: string,
        { name, description, type, value }: SettingUpdateValueDto,
        options?: IDatabaseOptions
    ): Promise<Setting> {
        return this.prismaService.setting.update({
            where: { id },
            data: {
                name,
                description,
                type,
                value,
            },
            ...options,
        });
    }

    async delete(id: string): Promise<boolean> {
        const isSuccess = await this.prismaService.setting.delete({
            where: { id },
        });
        return isSuccess !== null;
    }

    async getValue<T>(setting: Setting): Promise<T> {
        if (
            setting.type === ENUM_SETTING_DATA_TYPE.BOOLEAN &&
            (setting.value === 'true' || setting.value === 'false')
        ) {
            return (setting.value === 'true') as T;
        } else if (
            setting.type === ENUM_SETTING_DATA_TYPE.NUMBER &&
            this.helperNumberService.check(setting.value)
        ) {
            return this.helperNumberService.create(setting.value) as T;
        } else if (setting.type === ENUM_SETTING_DATA_TYPE.ARRAY_OF_STRING) {
            console.log(setting.value.split(','));
            return setting.value.split(',') as T;
        }

        return setting.value as T;
    }

    async checkValue(
        value: string,
        type: ENUM_SETTING_DATA_TYPE
    ): Promise<boolean> {
        if (
            type === ENUM_SETTING_DATA_TYPE.BOOLEAN &&
            (value === 'true' || value === 'false')
        ) {
            return true;
        } else if (
            type === ENUM_SETTING_DATA_TYPE.NUMBER &&
            this.helperNumberService.check(value)
        ) {
            return true;
        } else if (
            (type === ENUM_SETTING_DATA_TYPE.STRING ||
                type === ENUM_SETTING_DATA_TYPE.ARRAY_OF_STRING) &&
            typeof value === 'string'
        ) {
            return true;
        }

        return false;
    }

    async getMaintenance(): Promise<boolean> {
        const setting: Setting = await this.findOneByName('maintenance', {
            select: { value: true },
        });
        return this.getValue<boolean>(setting);
    }

    async getMobileNumberCountryCodeAllowed(): Promise<string[]> {
        return this.mobileNumberCountryCodeAllowed;
    }

    async getPasswordAttempt(): Promise<boolean> {
        return this.passwordAttempt;
    }

    async getMaxPasswordAttempt(): Promise<number> {
        return this.maxPasswordAttempt;
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean> {
        const isSuccess = await this.prismaService.setting.deleteMany({
            where: find,
            ...options,
        });
        return isSuccess !== null;
    }
}
