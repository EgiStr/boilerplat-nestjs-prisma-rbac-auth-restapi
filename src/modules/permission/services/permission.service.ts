import { Injectable } from '@nestjs/common';
import { Permission, Prisma } from '@prisma/client';

import { PrismaService } from 'src/common/databases/services/database.service';

import { ENUM_PERMISSION_GROUP } from 'src/modules/permission/constants/permission.enum.constant';
import { PermissionCreateDto } from 'src/modules/permission/dtos/permission.create.dto';
import { PermissionUpdateDescriptionDto } from 'src/modules/permission/dtos/permission.update-description.dto';
import { PermissionUpdateGroupDto } from 'src/modules/permission/dtos/permission.update-group.dto';
import { IPermissionGroup } from 'src/modules/permission/interfaces/permission.interface';
import { IPermissionService } from 'src/modules/permission/interfaces/permission.service.interface';

@Injectable()
export class PermissionService implements IPermissionService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll(
        find?: Record<string, any>,
        options?: Prisma.PermissionFindManyArgs
    ): Promise<Permission[]> {
        return this.prismaService.permission.findMany({
            where: { ...find },
            ...options,
        });
    }

    async findAllByIds(
        ids: string[],
        options?: Prisma.PermissionFindManyArgs
    ): Promise<Permission[]> {
        return this.prismaService.permission.findMany({
            where: { id: { in: ids } },
            ...options,
        });
    }

    async findAllByGroup(
        filterGroups?: Record<string, any>,
        options?: Prisma.PermissionFindManyArgs
    ): Promise<Permission[]> {
        return this.prismaService.permission.findMany({
            where: { ...filterGroups },
            ...options,
        });
    }

    async findOneById(
        id: string,
        options?: Prisma.PermissionFindUniqueArgs
    ): Promise<Permission> {
        return this.prismaService.permission.findUnique({
            where: { id },
            ...options,
        });
    }
    findPermissionByRole(
        roleId: string,
        options?: Prisma.PermissionFindManyArgs
    ): Promise<Permission[]> {
        return this.prismaService.permission.findMany({
            where: {
                roles: {
                    some: {
                        roleId,
                    },
                },
            },
            ...options,
        });
    }

    async findOne(
        find: Record<string, any>,
        options?: Prisma.PermissionFindUniqueArgs
    ): Promise<Permission> {
        return this.prismaService.permission.findUnique({
            where: { ...find },
            ...options,
        });
    }

    async getTotal(
        find?: Record<string, any>,
        options?: Prisma.PermissionCountArgs
    ): Promise<number> {
        return this.prismaService.permission.count({
            where: { ...find },
            ...options,
        });
    }

    async delete(id: string): Promise<Permission> {
        return this.prismaService.permission.delete({
            where: { id },
        });
    }

    async create(
        { group, code, description }: PermissionCreateDto,
        options?: Prisma.PermissionCreateArgs
    ): Promise<Permission> {
        return this.prismaService.permission.create({
            data: {
                group,
                code,
                description,
            },
            ...options,
        });
    }

    async updateDescription(
        id: string,
        { description }: PermissionUpdateDescriptionDto
    ): Promise<Permission> {
        return this.prismaService.permission.update({
            where: { id },
            data: { description },
        });
    }

    async updateGroup(
        id: string,
        { group }: PermissionUpdateGroupDto
    ): Promise<Permission> {
        return this.prismaService.permission.update({
            where: { id },
            data: { group },
        });
    }

    async active(id: string): Promise<Permission> {
        return this.prismaService.permission.update({
            where: { id },
            data: { isActive: true },
        });
    }

    async inactive(id: string): Promise<Permission> {
        return this.prismaService.permission.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async groupingByGroups(
        permissions: Permission[],
        scope?: ENUM_PERMISSION_GROUP[]
    ): Promise<IPermissionGroup[]> {
        const permissionGroups: ENUM_PERMISSION_GROUP[] =
            scope ?? Object.values(ENUM_PERMISSION_GROUP);

        const result: IPermissionGroup[] = permissionGroups.map((group) => {
            const permissionsGroup: Permission[] = permissions.filter(
                (permission) => permission.group === group
            );

            return { group, permissions: permissionsGroup };
        });

        return result;
    }

    async createMany(
        data: PermissionCreateDto[],
        options?: Prisma.PermissionCreateManyArgs
    ): Promise<boolean> {
        const createMany = data.map((item) => {
            return {
                group: item.group,
                code: item.code,
                description: item.description,
            };
        });

        const isSuccess = await this.prismaService.permission.createMany({
            data: createMany,
            ...options,
        });

        return isSuccess ? true : false;
    }

    async deleteMany(
        find: Record<string, any>,
        options?: Prisma.PermissionDeleteManyArgs
    ): Promise<boolean> {
        const isSuccess = await this.prismaService.permission.deleteMany({
            where: { ...find },
            ...options,
        });

        return isSuccess ? true : false;
    }
}
