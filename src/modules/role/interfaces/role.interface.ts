import { Permission, Role } from '@prisma/client';

export interface IRoleEntity extends Omit<Role, 'permissions'> {
    permissions: Permission[];
}

export interface IRoleDoc extends Omit<Role, 'permissions'> {
    permissions: Permission[];
}

export interface IRole extends Omit<Role, 'permissions'> {
    permissions: Permission[];
}
