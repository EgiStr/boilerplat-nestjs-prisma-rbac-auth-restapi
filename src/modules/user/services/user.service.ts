import { Injectable } from '@nestjs/common';
import { IUserService } from 'src/modules/user/interfaces/user.service.interface';

import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { ConfigService } from '@nestjs/config';
import { HelperStringService } from 'src/common/helper/services/helper.string.service';
import { UserCreateDto } from 'src/modules/user/dtos/user.create.dto';
import { IAuthPassword } from 'src/common/auth/interfaces/auth.interface';
import { UserUpdateNameDto } from 'src/modules/user/dtos/user.update-name.dto';
import { UserPayloadSerialization } from 'src/modules/user/serializations/user.payload.serialization';
import { plainToInstance } from 'class-transformer';
import { UserPayloadPermissionSerialization } from 'src/modules/user/serializations/user.payload-permission.serialization';
import { IPermissionGroup } from '../../permission/interfaces/permission.interface';
import { PrismaService } from 'src/common/databases/services/database.service';
import { IUser } from '../interfaces/user.interface';
import { Permission, Prisma, User } from '@prisma/client';

@Injectable()
export class UserService implements IUserService {
    private readonly uploadPath: string;

    constructor(
        private readonly helperDateService: HelperDateService,
        private readonly helperStringService: HelperStringService,
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService
    ) {
        this.uploadPath = this.configService.get<string>('user.uploadPath');
    }

    async findAll(
        find?: Record<string, any>,
        options?: Prisma.UserFindManyArgs
    ): Promise<IUser[]> {
        return this.prismaService.user.findMany({
            where: find,
            // join with role
            include: {
                roles: true,
            },
            ...options,
        });
    }

    async findOneById(
        id: string,
        options?: Prisma.UserFindUniqueArgs
    ): Promise<User> {
        return this.prismaService.user.findUnique({
            where: { id },
            ...options,
        });
    }

    async findOne(
        find: Record<string, any>,
        options?: Prisma.UserFindFirstArgs
    ): Promise<User> {
        return this.prismaService.user.findFirst({
            where: find,
            ...options,
        });
    }

    async findOneByEmail(
        email: string,
        options?: Prisma.UserFindFirstArgs
    ): Promise<User> {
        return this.prismaService.user.findFirst({
            where: { email },
            ...options,
        });
    }

    async getTotal(
        find?: Record<string, any>,
        options?: Prisma.UserCountArgs
    ): Promise<number> {
        return this.prismaService.user.count({
            where: find,
            ...options,
        });
    }

    async create(
        { fullName, email, jobTitle, role }: UserCreateDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        options?: Prisma.UserCreateArgs
    ): Promise<User> {
        return this.prismaService.user.create({
            data: {
                fullName,
                email,
                jobTitle,
                role,
                password: passwordHash,
                passwordExpired,
                passwordCreated,
                salt,
            },
            ...options,
        });
    }

    async existByEmail(
        email: string,
        options?: Prisma.UserFindUniqueOrThrowArgs
    ): Promise<boolean> {
        const user = await this.prismaService.user.findUniqueOrThrow({
            where: { email },
            ...options,
        });

        return !!user;
    }

    async delete(id: string): Promise<User> {
        return this.prismaService.user.delete({
            where: { id },
        });
    }

    async updateName(
        id: string,
        { fullName }: UserUpdateNameDto
    ): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                fullName,
            },
        });
    }

    async updatePassword(
        id: string,
        { passwordHash, passwordExpired, salt, passwordCreated }: IAuthPassword
    ): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                password: passwordHash,
                passwordExpired,
                passwordCreated,
                salt,
            },
        });
    }

    async active(id: string): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                isActive: true,
            },
        });
    }

    async inactive(id: string): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                isActive: false,
            },
        });
    }

    async blocked(id: string): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                blocked: true,
                blockedDate: this.helperDateService.create(new Date()),
            },
        });
    }

    async unblocked(id: string): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                blocked: false,
                blockedDate: null,
            },
        });
    }

    async maxPasswordAttempt(id: string): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                passwordAttempt: 5,
            },
        });
    }

    async increasePasswordAttempt(id: string): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                passwordAttempt: {
                    increment: 1,
                },
            },
        });
    }

    async resetPasswordAttempt(id: string): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                passwordAttempt: 0,
            },
        });
    }

    async updatePasswordExpired(
        id: string,
        passwordExpired: Date
    ): Promise<User> {
        return this.prismaService.user.update({
            where: { id },
            data: {
                passwordExpired,
            },
        });
    }

    async joinWithRole(id: string): Promise<IUser> {
        const users = await this.prismaService.user.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });
        return {
            ...users,
        };
    }

    async createPhotoFilename(): Promise<Record<string, any>> {
        const filename: string = this.helperStringService.random(20);

        return {
            path: this.uploadPath,
            filename: filename,
        };
    }

    async payloadSerialization(
        data: IUser | User
    ): Promise<UserPayloadSerialization> {
        return plainToInstance(UserPayloadSerialization, data);
    }

    async payloadPermissionSerialization(
        id: string,
        permissions: IPermissionGroup[]
    ): Promise<UserPayloadPermissionSerialization> {
        const permissionEntity: Permission[] = permissions
            .map((val) => val.permissions)
            .flat(1);
        return plainToInstance(UserPayloadPermissionSerialization, {
            id,
            permissions: permissionEntity,
        });
    }

    async deleteMany(
        find: Record<string, any>,
        options?: Prisma.UserDeleteManyArgs
    ): Promise<boolean> {
        const check = await this.prismaService.user.deleteMany({
            where: find,
            ...options,
        });

        return check.count > 0;
    }
}
