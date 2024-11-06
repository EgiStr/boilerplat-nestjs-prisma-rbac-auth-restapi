import { IAuthPassword } from 'src/common/auth/interfaces/auth.interface';

import { UserCreateDto } from 'src/modules/user/dtos/user.create.dto';
import { UserUpdateNameDto } from 'src/modules/user/dtos/user.update-name.dto';
import { IUser } from 'src/modules/user/interfaces/user.interface';

import { UserPayloadPermissionSerialization } from 'src/modules/user/serializations/user.payload-permission.serialization';
import { UserPayloadSerialization } from 'src/modules/user/serializations/user.payload.serialization';
import { IPermissionGroup } from '../../permission/interfaces/permission.interface';
import { User } from '@prisma/client';

export interface IUserService {
    findAll(find?: Record<string, any>, options?: any): Promise<IUser[]>;

    findOneById(id: string, options?: any): Promise<User>;

    findOne(find: Record<string, any>, options?: any): Promise<User>;

    findOneByEmail(email: string, options?: any): Promise<User>;

    getTotal(find?: Record<string, any>, options?: any): Promise<number>;

    create(
        { fullName, email, jobTitle, role }: UserCreateDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        options?: any
    ): Promise<User>;

    existByEmail(email: string, options?: any): Promise<boolean>;

    joinWithRole(id: string): Promise<IUser>;


    existByEmail(email: string, options?: any): Promise<boolean>;

    delete(id: string): Promise<User>;

    updateName(id: string, { fullName }: UserUpdateNameDto): Promise<User>;

    updatePassword(
        id: string,
        { passwordHash, passwordExpired, salt, passwordCreated }: IAuthPassword
    ): Promise<User>;

    active(id: string): Promise<User>;

    inactive(id: string): Promise<User>;

    blocked(id: string): Promise<User>;

    unblocked(id: string): Promise<User>;

    maxPasswordAttempt(id: string): Promise<User>;

    increasePasswordAttempt(id: string): Promise<User>;

    resetPasswordAttempt(id: string): Promise<User>;

    updatePasswordExpired(id: string, passwordExpired: Date): Promise<User>;

    createPhotoFilename(): Promise<Record<string, any>>;

    payloadSerialization(data: IUser): Promise<UserPayloadSerialization>;

    payloadPermissionSerialization(
        id: string,
        permissions: IPermissionGroup[]
    ): Promise<UserPayloadPermissionSerialization>;

    deleteMany(find: Record<string, any>, options?: any): Promise<boolean>;
}
