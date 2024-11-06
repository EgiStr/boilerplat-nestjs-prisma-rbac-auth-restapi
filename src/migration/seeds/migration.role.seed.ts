import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { PermissionService } from 'src/modules/permission/services/permission.service';
import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';
import { RoleService } from 'src/modules/role/services/role.service';
import { RoleCreateDto } from 'src/modules/role/dtos/role.create.dto';
import { Permission } from '@prisma/client';

@Injectable()
export class MigrationRoleSeed {
    constructor(
        private readonly permissionService: PermissionService,
        private readonly roleService: RoleService
    ) {}

    @Command({
        command: 'seed:role',
        describe: 'seed roles',
    })
    async seeds(): Promise<void> {
        const permissions: Permission[] =
            await this.permissionService.findAll();

        const permissionsMap: string[] = permissions.map(
            (permission: Permission) => permission.id
        );

        const dataAdmin: RoleCreateDto[] = [
            {
                name: 'author',
                permissions: permissionsMap,
                accessFor: ENUM_AUTH_ACCESS_FOR.AUTHOR,
            },
            {
                name: 'user',
                permissions: [],
                accessFor: ENUM_AUTH_ACCESS_FOR.USER,
            },
        ];

        try {
            await this.roleService.createMany(dataAdmin);
            await this.roleService.createSuperAdmin();
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
    }

    @Command({
        command: 'remove:role',
        describe: 'remove roles',
    })
    async remove(): Promise<void> {
        try {
            await this.roleService.deleteMany({});
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
    }
}
