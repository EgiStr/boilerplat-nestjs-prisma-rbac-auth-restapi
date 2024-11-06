import { RoleCreateDto } from 'src/modules/role/dtos/role.create.dto';
import { RoleUpdateNameDto } from 'src/modules/role/dtos/role.update-name.dto';
import { RoleUpdatePermissionDto } from 'src/modules/role/dtos/role.update-permission.dto';

import { IRole } from './role.interface';
import { Role } from '@prisma/client';

export interface IRoleService {
    findAll(find?: Record<string, any>, options?: any): Promise<Role[]>;

    findOneById(id: string, options?: any): Promise<Role>;

    findOne(find: Record<string, any>, options?: any): Promise<Role>;

    findOneByName(name: string, options?: any): Promise<Role>;

    getTotal(find?: Record<string, any>, options?: any): Promise<number>;

    exist(id: string, options?: any): Promise<boolean>;

    existByName(name: string, options?: any): Promise<boolean>;

    create(
        { accessFor, permissions, name }: RoleCreateDto,
        options?: any
    ): Promise<Role>;

    createSuperAdmin(options?: any): Promise<Role>;

    updateName(id: string, { name }: RoleUpdateNameDto): Promise<Role>;

    updatePermission(
        id: string,
        { accessFor, permissions }: RoleUpdatePermissionDto
    ): Promise<Role>;

    active(id: string): Promise<Role>;

    inactive(id: string): Promise<Role>;

    joinWithPermission(id: string): Promise<IRole>;

    delete(id: string): Promise<Role>;

    deleteMany(find: Record<string, any>, options?: any): Promise<boolean>;

    createMany(data: RoleCreateDto[], options?: any): Promise<boolean>;

    getAccessFor(): Promise<string[]>;
}
