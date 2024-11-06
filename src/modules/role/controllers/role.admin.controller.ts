import {
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Patch,
    Post,
    Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Permission, Role } from '@prisma/client';
import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';
import { ENUM_AUTH_PERMISSIONS } from 'src/common/auth/constants/auth.enum.permission.constant';
import { AuthJwtAdminAccessProtected } from 'src/common/auth/decorators/auth.jwt.decorator';
import { AuthPermissionProtected } from 'src/common/auth/decorators/auth.permission.decorator';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import {
    PaginationQuery,
    PaginationQueryFilterInBoolean,
    PaginationQueryFilterInEnum,
} from 'src/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import { RequestParamGuard } from 'src/common/request/decorators/request.decorator';
import {
    Response,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
import { ResponseIdSerialization } from 'src/common/response/serializations/response.id.serialization';
import { ENUM_PERMISSION_STATUS_CODE_ERROR } from 'src/modules/permission/constants/permission.status-code.constant';
import { PermissionService } from 'src/modules/permission/services/permission.service';
import {
    ROLE_DEFAULT_ACCESS_FOR,
    ROLE_DEFAULT_AVAILABLE_ORDER_BY,
    ROLE_DEFAULT_AVAILABLE_SEARCH,
    ROLE_DEFAULT_IS_ACTIVE,
    ROLE_DEFAULT_ORDER_BY,
    ROLE_DEFAULT_ORDER_DIRECTION,
    ROLE_DEFAULT_PER_PAGE,
} from 'src/modules/role/constants/role.list.constant';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant';
import {
    RoleDeleteGuard,
    RoleGetGuard,
    RoleUpdateActiveGuard,
    RoleUpdateGuard,
    RoleUpdateInactiveGuard,
} from 'src/modules/role/decorators/role.admin.decorator';
import { GetRole } from 'src/modules/role/decorators/role.decorator';
import {
    RoleAccessForDoc,
    RoleActiveDoc,
    RoleCreateDoc,
    RoleDeleteDoc,
    RoleGetDoc,
    RoleInactiveDoc,
    RoleListDoc,
    RoleUpdateDoc,
} from 'src/modules/role/docs/role.admin.doc';
import { RoleCreateDto } from 'src/modules/role/dtos/role.create.dto';
import { RoleRequestDto } from 'src/modules/role/dtos/role.request.dto';
import { RoleUpdateNameDto } from 'src/modules/role/dtos/role.update-name.dto';
import { RoleUpdatePermissionDto } from 'src/modules/role/dtos/role.update-permission.dto';

import { RoleAccessForSerialization } from 'src/modules/role/serializations/role.access-for.serialization';
import { RoleGetSerialization } from 'src/modules/role/serializations/role.get.serialization';
import { RoleListSerialization } from 'src/modules/role/serializations/role.list.serialization';
import { RoleService } from 'src/modules/role/services/role.service';
import { IRole } from '../interfaces/role.interface';

@ApiTags('modules.admin.role')
@Controller({
    version: '1',
    path: '/roles',
})
export class RoleAdminController {
    constructor(
        private readonly paginationService: PaginationService,
        private readonly permissionService: PermissionService,
        private readonly roleService: RoleService
    ) {}

    @RoleListDoc()
    @ResponsePaging('role.list', {
        serialization: RoleListSerialization,
    })
    @AuthPermissionProtected(ENUM_AUTH_PERMISSIONS.ROLE_READ)
    @AuthJwtAdminAccessProtected()
    @Get('/')
    async list(
        @PaginationQuery(
            ROLE_DEFAULT_PER_PAGE,
            ROLE_DEFAULT_ORDER_BY,
            ROLE_DEFAULT_ORDER_DIRECTION,
            ROLE_DEFAULT_AVAILABLE_SEARCH,
            ROLE_DEFAULT_AVAILABLE_ORDER_BY
        )
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInBoolean('isActive', ROLE_DEFAULT_IS_ACTIVE)
        isActive: Record<string, any>,
        @PaginationQueryFilterInEnum(
            'accessFor',
            ROLE_DEFAULT_ACCESS_FOR,
            ENUM_AUTH_ACCESS_FOR
        )
        accessFor: Record<string, any>
    ): Promise<IResponsePaging> {
        const find: Record<string, any> = {
            ..._search,
            ...isActive,
            ...accessFor,
        };

        const roles: Role[] = await this.roleService.findAll(find, {
            skip: _offset,
            take: _limit,
            orderBy: _order,
        });

        const total: number = await this.roleService.getTotal(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );

        return {
            _pagination: { total, totalPage },
            data: roles,
        };
    }

    @RoleGetDoc()
    @Response('role.get', {
        serialization: RoleGetSerialization,
    })
    @RoleGetGuard()
    @RequestParamGuard(RoleRequestDto)
    @AuthPermissionProtected(ENUM_AUTH_PERMISSIONS.ROLE_READ)
    @AuthJwtAdminAccessProtected()
    @Get('/:role')
    async get(@GetRole(true) role: Role): Promise<IResponse> {
        const roleJoin: IRole = await this.roleService.joinWithPermission(
            role.id
        );
        return {
            data: roleJoin,
        };
    }

    @RoleCreateDoc()
    @Response('role.create', {
        serialization: ResponseIdSerialization,
    })
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.ROLE_READ,
        ENUM_AUTH_PERMISSIONS.ROLE_CREATE
    )
    @AuthJwtAdminAccessProtected()
    @Post('/')
    async create(
        @Body()
        { name, permissions, accessFor }: RoleCreateDto
    ): Promise<IResponse> {
        const exist: boolean = await this.roleService.existByName(name);
        if (exist) {
            throw new ConflictException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_EXIST_ERROR,
                message: 'role.error.exist',
            });
        }

        const permissionsCheck: Permission[] =
            await this.permissionService.findAllByIds(permissions);
        if (permissionsCheck.length !== permissions.length) {
            throw new NotFoundException({
                statusCode:
                    ENUM_PERMISSION_STATUS_CODE_ERROR.PERMISSION_NOT_FOUND_ERROR,
                message: 'permission.error.notFound',
            });
        }

        try {
            const create = await this.roleService.create({
                name,
                permissions,
                accessFor,
            });

            return {
                data: { id: create.id },
            };
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    @RoleUpdateDoc()
    @Response('role.update', {
        serialization: ResponseIdSerialization,
    })
    @RoleUpdateGuard()
    @RequestParamGuard(RoleRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.ROLE_READ,
        ENUM_AUTH_PERMISSIONS.ROLE_UPDATE
    )
    @AuthJwtAdminAccessProtected()
    @Put('/:role')
    async update(
        @GetRole() role: Role,
        @Body()
        { name }: RoleUpdateNameDto
    ): Promise<IResponse> {
        const check: boolean = await this.roleService.existByName(name);
        if (check) {
            throw new ConflictException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_EXIST_ERROR,
                message: 'role.error.exist',
            });
        }

        try {
            await this.roleService.updateName(role.id, { name });
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return {
            data: { id: role.id },
        };
    }

    @RoleUpdateDoc()
    @Response('role.updatePermission', {
        serialization: ResponseIdSerialization,
    })
    @RoleUpdateGuard()
    @RequestParamGuard(RoleRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.ROLE_READ,
        ENUM_AUTH_PERMISSIONS.ROLE_UPDATE
    )
    @AuthJwtAdminAccessProtected()
    @Put('/:role/permission')
    async updatePermission(
        @GetRole() role: Role,
        @Body()
        { accessFor, permissions }: RoleUpdatePermissionDto
    ): Promise<IResponse> {
        const permissionsCheck: Permission[] =
            await this.permissionService.findAllByIds(permissions);

        if (permissionsCheck.length !== permissions.length) {
            throw new NotFoundException({
                statusCode:
                    ENUM_PERMISSION_STATUS_CODE_ERROR.PERMISSION_NOT_FOUND_ERROR,
                message: 'permission.error.notFound',
            });
        }

        try {
            await this.roleService.updatePermission(role.id, {
                accessFor,
                permissions,
            });
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return {
            data: { id: role.id },
        };
    }

    @RoleDeleteDoc()
    @Response('role.delete')
    @RoleDeleteGuard()
    @RequestParamGuard(RoleRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.ROLE_READ,
        ENUM_AUTH_PERMISSIONS.ROLE_DELETE
    )
    @AuthJwtAdminAccessProtected()
    @Delete('/:role')
    async delete(@GetRole() role: Role): Promise<void> {
        try {
            await this.roleService.delete(role.id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @RoleInactiveDoc()
    @Response('role.inactive')
    @RoleUpdateInactiveGuard()
    @RequestParamGuard(RoleRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.ROLE_READ,
        ENUM_AUTH_PERMISSIONS.ROLE_UPDATE,
        ENUM_AUTH_PERMISSIONS.ROLE_INACTIVE
    )
    @AuthJwtAdminAccessProtected()
    @Patch('/:role/inactive')
    async inactive(@GetRole() role: Role): Promise<void> {
        try {
            await this.roleService.inactive(role.id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @RoleActiveDoc()
    @Response('role.active')
    @RoleUpdateActiveGuard()
    @RequestParamGuard(RoleRequestDto)
    @AuthPermissionProtected(
        ENUM_AUTH_PERMISSIONS.ROLE_READ,
        ENUM_AUTH_PERMISSIONS.ROLE_UPDATE,
        ENUM_AUTH_PERMISSIONS.ROLE_ACTIVE
    )
    @AuthJwtAdminAccessProtected()
    @Patch('/:role/active')
    async active(@GetRole() role: Role): Promise<void> {
        try {
            await this.roleService.active(role.id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @RoleAccessForDoc()
    @Response('role.accessFor', { serialization: RoleAccessForSerialization })
    @AuthPermissionProtected(ENUM_AUTH_PERMISSIONS.ROLE_READ)
    @AuthJwtAdminAccessProtected()
    @Get('/access-for')
    async accessFor(): Promise<IResponse> {
        const accessFor: string[] = await this.roleService.getAccessFor();

        return { data: { accessFor } };
    }
}
