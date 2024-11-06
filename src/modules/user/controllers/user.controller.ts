import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
    AuthJwtRefreshProtected,
    AuthJwtToken,
} from 'src/common/auth/decorators/auth.jwt.decorator';
import { AuthService } from 'src/common/auth/services/auth.service';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import { ENUM_LOGGER_ACTION } from 'src/common/logger/constants/logger.enum.constant';
import { Logger } from 'src/common/logger/decorators/logger.decorator';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { SettingService } from 'src/common/setting/services/setting.service';
import { PermissionService } from 'src/modules/permission/services/permission.service';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/constants/user.status-code.constant';
import { GetUser } from 'src/modules/user/decorators/user.decorator';
import { UserProfileGuard } from 'src/modules/user/decorators/user.public.decorator';
import {
    UserChangePasswordDoc,
    UserGrantPermissionDoc,
    UserInfoDoc,
    UserLoginDoc,
    UserProfileDoc,
    UserRefreshDoc,
} from 'src/modules/user/docs/user.doc';
import { UserChangePasswordDto } from 'src/modules/user/dtos/user.change-password.dto';
import { UserGrantPermissionDto } from 'src/modules/user/dtos/user.grant-permission.dto';
import { UserLoginDto } from 'src/modules/user/dtos/user.login.dto';
import { UserGrantPermissionSerialization } from 'src/modules/user/serializations/user.grant-permission.serialization';
import { UserInfoSerialization } from 'src/modules/user/serializations/user.info.serialization';
import { UserLoginSerialization } from 'src/modules/user/serializations/user.login.serialization';
import { UserPayloadPermissionSerialization } from 'src/modules/user/serializations/user.payload-permission.serialization';
import { UserPayloadSerialization } from 'src/modules/user/serializations/user.payload.serialization';
import { UserProfileSerialization } from 'src/modules/user/serializations/user.profile.serialization';
import { UserService } from 'src/modules/user/services/user.service';
import { IAuthPassword } from '../../../common/auth/interfaces/auth.interface';
import { IPermissionGroup } from '../../permission/interfaces/permission.interface';
import { Permission, User } from '@prisma/client';
import { IUser } from '../interfaces/user.interface';

@ApiTags('modules.user')
@Controller({
    version: '1',
    path: '/users',
})
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly settingService: SettingService,
        private readonly permissionService: PermissionService
    ) {}

    @UserLoginDoc()
    @Response('user.login', {
        serialization: UserLoginSerialization,
    })
    @Logger(ENUM_LOGGER_ACTION.LOGIN, { tags: ['login', 'withEmail'] })
    @HttpCode(HttpStatus.OK)
    @Post('/login')
    async login(
        @Body() { email, password, rememberMe }: UserLoginDto
    ): Promise<IResponse> {
        const user: User = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'user.error.notFound',
            });
        }

        const passwordAttempt: boolean =
            await this.settingService.getPasswordAttempt();
        const maxPasswordAttempt: number =
            await this.settingService.getMaxPasswordAttempt();
        if (passwordAttempt && user.passwordAttempt >= maxPasswordAttempt) {
            throw new ForbiddenException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_ATTEMPT_MAX_ERROR,
                message: 'user.error.passwordAttemptMax',
            });
        }

        const validate: boolean = await this.authService.validateUser(
            password,
            user.password
        );
        if (!validate) {
            try {
                await this.userService.increasePasswordAttempt(user.id);
            } catch (err: any) {
                throw new InternalServerErrorException({
                    statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                    message: 'http.serverError.internalServerError',
                    _error: err.message,
                });
            }

            throw new BadRequestException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR,
                message: 'user.error.passwordNotMatch',
            });
        } else if (user.blocked) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_BLOCKED_ERROR,
                message: 'user.error.blocked',
            });
        } else if (!user.isActive || user.inactivePermanent) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_ERROR,
                message: 'user.error.inactive',
            });
        }

        const userWithRole: IUser = await this.userService.joinWithRole(
            user.id
        );
        if (!userWithRole.roles.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR,
                message: 'role.error.inactive',
            });
        }

        try {
            await this.userService.resetPasswordAttempt(user.id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        const payload: UserPayloadSerialization =
            await this.userService.payloadSerialization(userWithRole);
        const tokenType: string = await this.authService.getTokenType();
        const expiresIn: number =
            await this.authService.getAccessTokenExpirationTime();
        rememberMe = rememberMe ? true : false;
        const payloadAccessToken: Record<string, any> =
            await this.authService.createPayloadAccessToken(
                payload,
                rememberMe
            );
        const payloadRefreshToken: Record<string, any> =
            await this.authService.createPayloadRefreshToken(
                payload.id,
                rememberMe,
                {
                    loginDate: payloadAccessToken.loginDate,
                }
            );

        const payloadEncryption = await this.authService.getPayloadEncryption();
        let payloadHashedAccessToken: Record<string, any> | string =
            payloadAccessToken;
        let payloadHashedRefreshToken: Record<string, any> | string =
            payloadRefreshToken;

        if (payloadEncryption) {
            payloadHashedAccessToken =
                await this.authService.encryptAccessToken(payloadAccessToken);
            payloadHashedRefreshToken =
                await this.authService.encryptRefreshToken(payloadRefreshToken);
        }

        const accessToken: string = await this.authService.createAccessToken(
            payloadHashedAccessToken
        );

        const refreshToken: string = await this.authService.createRefreshToken(
            payloadHashedRefreshToken,
            { rememberMe }
        );

        const checkPasswordExpired: boolean =
            await this.authService.checkPasswordExpired(user.passwordExpired);

        if (checkPasswordExpired) {
            return {
                _metadata: {
                    // override status code and message
                    customProperty: {
                        // override status code and message
                        statusCode:
                            ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_EXPIRED_ERROR,
                        message: 'user.error.passwordExpired',
                    },
                },
                data: { tokenType, expiresIn, accessToken, refreshToken },
            };
        }

        return {
            data: {
                tokenType,
                expiresIn,
                accessToken,
                refreshToken,
            },
        };
    }

    @UserRefreshDoc()
    @Response('user.refresh', { serialization: UserLoginSerialization })
    @AuthJwtRefreshProtected()
    @HttpCode(HttpStatus.OK)
    @Post('/refresh-token')
    async refresh(
        @AuthJwtPayload()
        { id, rememberMe, loginDate }: Record<string, any>,
        @AuthJwtToken() refreshToken: string
    ): Promise<IResponse> {
        const user: User = await this.userService.findOneById(id);

        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'user.error.notFound',
            });
        } else if (user.blocked) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_BLOCKED_ERROR,
                message: 'user.error.blocked',
            });
        } else if (!user.isActive || user.inactivePermanent) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_ERROR,
                message: 'user.error.inactive',
            });
        }

        const userWithRole: IUser = await this.userService.joinWithRole(
            user.id
        );
        if (!userWithRole.roles.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR,
                message: 'role.error.inactive',
            });
        }

        const checkPasswordExpired: boolean =
            await this.authService.checkPasswordExpired(user.passwordExpired);

        if (checkPasswordExpired) {
            throw new ForbiddenException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_EXPIRED_ERROR,
                message: 'user.error.passwordExpired',
            });
        }

        const payload: UserPayloadSerialization =
            await this.userService.payloadSerialization(userWithRole);
        const tokenType: string = await this.authService.getTokenType();
        const expiresIn: number =
            await this.authService.getAccessTokenExpirationTime();
        const payloadAccessToken: Record<string, any> =
            await this.authService.createPayloadAccessToken(
                payload,
                rememberMe,
                {
                    loginDate,
                }
            );

        const payloadEncryption = await this.authService.getPayloadEncryption();
        let payloadHashedAccessToken: Record<string, any> | string =
            payloadAccessToken;

        if (payloadEncryption) {
            payloadHashedAccessToken =
                await this.authService.encryptAccessToken(payloadAccessToken);
        }

        const accessToken: string = await this.authService.createAccessToken(
            payloadHashedAccessToken
        );

        return {
            data: {
                tokenType,
                expiresIn,
                accessToken,
                refreshToken,
            },
        };
    }

    @UserChangePasswordDoc()
    @Response('user.changePassword')
    @AuthJwtAccessProtected()
    @Patch('/change-password')
    async changePassword(
        @Body() body: UserChangePasswordDto,
        @AuthJwtPayload('id') id: string
    ): Promise<void> {
        const user: User = await this.userService.findOneById(id);
        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'user.error.notFound',
            });
        }

        const passwordAttempt: boolean =
            await this.settingService.getPasswordAttempt();
        const maxPasswordAttempt: number =
            await this.settingService.getMaxPasswordAttempt();
        if (passwordAttempt && user.passwordAttempt >= maxPasswordAttempt) {
            throw new ForbiddenException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_ATTEMPT_MAX_ERROR,
                message: 'user.error.passwordAttemptMax',
            });
        }

        const matchPassword: boolean = await this.authService.validateUser(
            body.oldPassword,
            user.password
        );
        if (!matchPassword) {
            try {
                await this.userService.increasePasswordAttempt(user.id);
            } catch (err: any) {
                throw new InternalServerErrorException({
                    statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                    message: 'http.serverError.internalServerError',
                    _error: err.message,
                });
            }

            throw new BadRequestException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NOT_MATCH_ERROR,
                message: 'user.error.passwordNotMatch',
            });
        }

        const newMatchPassword: boolean = await this.authService.validateUser(
            body.newPassword,
            user.password
        );
        if (newMatchPassword) {
            throw new BadRequestException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_NEW_MUST_DIFFERENCE_ERROR,
                message: 'user.error.newPasswordMustDifference',
            });
        }

        try {
            await this.userService.resetPasswordAttempt(user.id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        try {
            const password: IAuthPassword =
                await this.authService.createPassword(body.newPassword);

            await this.userService.updatePassword(user.id, password);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }

    @UserInfoDoc()
    @Response('user.info', { serialization: UserInfoSerialization })
    @AuthJwtAccessProtected()
    @Get('/info')
    async info(
        @AuthJwtPayload() user: UserPayloadSerialization
    ): Promise<IResponse> {
        return { data: user };
    }

    @UserGrantPermissionDoc()
    @Response('user.grantPermission', {
        serialization: UserGrantPermissionSerialization,
    })
    @AuthJwtAccessProtected()
    @HttpCode(HttpStatus.OK)
    @Post('/grant-permission')
    async grantPermission(
        @AuthJwtPayload() payload: UserPayloadSerialization,
        @Body() { scope }: UserGrantPermissionDto
    ): Promise<IResponse> {
        const user: User = await this.userService.findOneById(payload.id);
        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'user.error.notFound',
            });
        }

        const userWithRole: IUser = await this.userService.joinWithRole(
            user.id
        );
        if (!userWithRole.roles.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR,
                message: 'role.error.inactive',
            });
        }

        const permissions: Permission[] =
            await this.permissionService.findPermissionByRole(
                userWithRole.roles.id
            );

        const grantPermissions: IPermissionGroup[] =
            await this.permissionService.groupingByGroups(permissions, scope);

        const payloadPermission: UserPayloadPermissionSerialization =
            await this.userService.payloadPermissionSerialization(
                user.id,
                grantPermissions
            );

        const expiresIn: number =
            await this.authService.getPermissionTokenExpirationTime();
        const payloadPermissionToken: Record<string, any> =
            await this.authService.createPayloadPermissionToken(
                payloadPermission
            );

        const payloadEncryption = await this.authService.getPayloadEncryption();
        let payloadHashedPermissionToken: Record<string, any> | string =
            payloadPermissionToken;

        if (payloadEncryption) {
            payloadHashedPermissionToken =
                await this.authService.encryptPermissionToken(
                    payloadPermissionToken
                );
        }

        const permissionToken: string =
            await this.authService.createPermissionToken(
                payloadHashedPermissionToken
            );

        return {
            data: { permissionToken, expiresIn },
        };
    }

    @UserProfileDoc()
    @Response('user.profile', {
        serialization: UserProfileSerialization,
    })
    @UserProfileGuard()
    @AuthJwtAccessProtected()
    @Get('/profile')
    async profile(@GetUser() user: User): Promise<IResponse> {
        const userWithRole: IUser = await this.userService.joinWithRole(
            user.id
        );
        return { data: userWithRole };
    }
}
