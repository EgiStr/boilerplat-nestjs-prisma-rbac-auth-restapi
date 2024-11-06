import { Setting } from '@prisma/client';
import {
    IDatabaseCreateOptions,
    IDatabaseFindOneOptions,
    IDatabaseManyOptions,
    IDatabaseOptions,
} from 'src/common/databases/interfaces/database.interface';
import { ENUM_SETTING_DATA_TYPE } from 'src/common/setting/constants/setting.enum.constant';
import { SettingCreateDto } from 'src/common/setting/dtos/setting.create.dto';
import { SettingUpdateValueDto } from 'src/common/setting/dtos/setting.update-value.dto';

export interface ISettingService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<Setting[]>;

    findOneById(
        id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<Setting>;

    findOneByName(
        name: string,
        options?: IDatabaseFindOneOptions
    ): Promise<Setting>;

    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<number>;

    create(
        { name, description, type, value }: SettingCreateDto,
        options?: IDatabaseCreateOptions
    ): Promise<Setting>;

    updateValue(
        id: string,
        { description, type, value }: SettingUpdateValueDto,
        options?: IDatabaseOptions
    ): Promise<Setting>;

    delete(id: string): Promise<boolean>;

    getValue<T>(setting: any): Promise<T>;

    checkValue(value: string, type: ENUM_SETTING_DATA_TYPE): Promise<boolean>;

    getMaintenance(): Promise<boolean>;

    getMobileNumberCountryCodeAllowed(): Promise<string[]>;

    getPasswordAttempt(): Promise<boolean>;

    getMaxPasswordAttempt(): Promise<number>;

    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseManyOptions
    ): Promise<boolean>;
}
