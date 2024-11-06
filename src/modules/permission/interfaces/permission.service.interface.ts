import { PermissionCreateDto } from 'src/modules/permission/dtos/permission.create.dto';
import { PermissionUpdateGroupDto } from 'src/modules/permission/dtos/permission.update-group.dto';
import { PermissionUpdateDescriptionDto } from 'src/modules/permission/dtos/permission.update-description.dto';
import { IPermissionGroup } from 'src/modules/permission/interfaces/permission.interface';
import { ENUM_PERMISSION_GROUP } from '../constants/permission.enum.constant';

import { Permission, Prisma } from '@prisma/client';

export interface IPermissionService {
    findAll(
        find?: Record<string, any>,
        options?: Prisma.PermissionFindManyArgs
    ): Promise<Permission[]>;

    findAllByIds(
        ids: string[],
        options?: Prisma.PermissionFindManyArgs
    ): Promise<Permission[]>;

    findPermissionByRole(
        roleId: string,
        options?: Prisma.PermissionFindManyArgs
    ): Promise<Permission[]>;

    findAllByGroup(
        filterGroups?: Record<string, any>,
        options?: Prisma.PermissionFindManyArgs
    ): Promise<Permission[]>;

    findOneById(
        id: string,
        options?: Prisma.PermissionFindUniqueArgs
    ): Promise<Permission>;

    findOne(
        find: Record<string, any>,
        options?: Prisma.PermissionFindUniqueArgs
    ): Promise<Permission>;

    getTotal(
        find?: Record<string, any>,
        options?: Prisma.PermissionCountArgs
    ): Promise<number>;

    delete(id: string): Promise<Permission>;

    create(
        { group, code, description }: PermissionCreateDto,
        options?: Prisma.PermissionCreateArgs
    ): Promise<Permission>;

    updateDescription(
        id: string,
        { description }: PermissionUpdateDescriptionDto
    ): Promise<Permission>;

    updateGroup(
        id: string,
        data: PermissionUpdateGroupDto
    ): Promise<Permission>;

    active(id: string): Promise<Permission>;

    inactive(id: string): Promise<Permission>;

    groupingByGroups(
        permissions: Permission[],
        scope?: ENUM_PERMISSION_GROUP[]
    ): Promise<IPermissionGroup[]>;

    createMany(
        data: PermissionCreateDto[],
        options?: Prisma.PermissionCreateManyArgs
    ): Promise<boolean>;

    deleteMany(
        find: Record<string, any>,
        options?: Prisma.PermissionDeleteManyArgs
    ): Promise<boolean>;
}
