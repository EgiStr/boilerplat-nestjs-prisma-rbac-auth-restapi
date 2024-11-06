import { Injectable } from '@nestjs/common';
import {
    ENUM_AUTH_ACCESS_FOR,
    ENUM_AUTH_ACCESS_FOR_DEFAULT,
} from 'src/common/auth/constants/auth.enum.constant';

import { RoleCreateDto } from 'src/modules/role/dtos/role.create.dto';
import { RoleUpdateNameDto } from 'src/modules/role/dtos/role.update-name.dto';
import { RoleUpdatePermissionDto } from 'src/modules/role/dtos/role.update-permission.dto';
import { IRoleService } from 'src/modules/role/interfaces/role.service.interface';
import { IRole } from '../interfaces/role.interface';
import { PrismaService } from 'src/common/databases/services/database.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RoleService implements IRoleService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll(
        find?: Record<string, any>,
        options?: Prisma.RoleFindManyArgs
    ): Promise<Role[]> {
        return this.prismaService.role.findMany({
            where: find,
            ...options,
        });
    }

    async findOneById(
        id: string,
        options?: Prisma.RoleFindUniqueArgs
    ): Promise<Role> {
        return this.prismaService.role.findUnique({
            where: {
                id,
            },
            ...options,
        });
    }

    async findOne(
        find: Record<string, any>,
        options?: Prisma.RoleFindFirstArgs
    ): Promise<Role> {
        return this.prismaService.role.findFirst({
            where: find,
            ...options,
        });
    }

    async findOneByName(
        name: string,
        options?: Prisma.RoleFindFirstArgs
    ): Promise<Role> {
        return this.prismaService.role.findFirst({
            where: { name },
            ...options,
        });
    }

    async getTotal(
        find?: Record<string, any>,
        options?: Prisma.RoleCountArgs
    ): Promise<number> {
        return this.prismaService.role.count({
            where: find,
        });
    }

    async exist(
        id: string,
        options?: Prisma.RoleFindFirstArgs
    ): Promise<boolean> {
        const role = await this.prismaService.role.findFirst({
            where: { id },
            ...options,
        });
        return !!role;
    }

    async existByName(
        name: string,
        options?: Prisma.RoleFindUniqueArgs
    ): Promise<boolean> {
        const role = await this.prismaService.role.findUnique({
            where: { name },
            ...options,
        });

        return !!role;
    }

    async create(
        { accessFor, permissions, name }: RoleCreateDto,
        options?: Prisma.RoleCreateArgs
    ): Promise<Role> {
        const role = await this.prismaService.role.create({
            data: {
                accessFor,
                name,
            },
            ...options,
        });

        await this.prismaService.rolePermission.createMany({
            data: permissions.map((permissionId) => ({
                roleId: role.id,
                permissionId,
            })),
        });

        return role;
    }

    async createSuperAdmin(options?: Prisma.RoleCreateArgs): Promise<Role> {
        return this.prismaService.role.create({
            data: {
                name: 'superadmin',
                accessFor: ENUM_AUTH_ACCESS_FOR.SUPER_ADMIN,
            },
            ...options,
        });
    }

    async updateName(id: string, { name }: RoleUpdateNameDto): Promise<Role> {
        return this.prismaService.role.update({
            where: {
                id,
            },
            data: {
                name,
            },
        });
    }

    async joinWithPermission(id: string): Promise<IRole> {
        const role = await this.prismaService.role.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                name: true,
                accessFor: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                permissions: {
                    select: {
                        permission: true,
                    },
                },
            },
        });

        return {
            ...role,
            permissions: role.permissions.map(
                (rolePermission) => rolePermission.permission
            ),
        };
    }

    async updatePermission(
        id: string,
        { accessFor, permissions }: RoleUpdatePermissionDto
    ): Promise<Role> {
        await this.prismaService.rolePermission.deleteMany({
            where: { roleId: id },
        });

        await this.prismaService.rolePermission.createMany({
            data: permissions.map((permissionId) => ({
                roleId: id,
                permissionId,
            })),
        });

        return this.prismaService.role.update({
            where: {
                id,
            },
            data: {
                accessFor,
            },
        });
    }

    async active(id: string): Promise<Role> {
        return this.prismaService.role.update({
            where: {
                id,
            },
            data: {
                isActive: true,
            },
        });
    }

    async inactive(id: string): Promise<Role> {
        return this.prismaService.role.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });
    }

    async delete(id: string): Promise<Role> {
        return this.prismaService.role.delete({
            where: {
                id,
            },
        });
    }

    async deleteMany(
        find: Record<string, any>,
        options?: Prisma.RoleDeleteManyArgs
    ): Promise<boolean> {
        const result = await this.prismaService.role.deleteMany({
            where: find,
            ...options,
        });
        return result.count > 0;
    }

    async createMany(
        data: RoleCreateDto[],
        options?: Prisma.RoleCreateManyArgs
    ): Promise<boolean> {
        await this.prismaService.role.createMany({
            data: data.map(({ accessFor, name }) => ({
                accessFor,
                name,
            })),
            ...options,
        });

        const roles = await this.prismaService.role.findMany({
            where: {
            name: {
                in: data.map(({ name }) => name),
            },
            },
        });

        const rolePermissions = data.flatMap(({ permissions, name }) => {
            const role = roles.find((r) => r.name === name);
            return permissions.map((permissionId) => ({
            roleId: role.id,
            permissionId,
            }));
        });

        await this.prismaService.rolePermission.createMany({
            data: rolePermissions,
        });

        return true;
    }

    async getAccessFor(): Promise<string[]> {
        return Object.values(ENUM_AUTH_ACCESS_FOR_DEFAULT);
    }
}
