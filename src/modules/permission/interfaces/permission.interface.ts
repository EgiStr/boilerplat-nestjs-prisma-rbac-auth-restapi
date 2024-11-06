import { Permission } from '@prisma/client';
import { ENUM_PERMISSION_GROUP } from 'src/modules/permission/constants/permission.enum.constant';

export interface IPermissionGroup {
    group: ENUM_PERMISSION_GROUP;
    permissions: Permission[];
}

export interface IPermission extends Omit<Permission, 'permissions'> {
    permissions: Permission[];
}
