import {
    Body,
    ConflictException,
    Controller,
    Delete,
    InternalServerErrorException,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import {
    AuthJwtPayload,
    AuthJwtPublicAccessProtected,
} from 'src/common/auth/decorators/auth.jwt.decorator';
import { AuthService } from 'src/common/auth/services/auth.service';
import { ENUM_ERROR_STATUS_CODE_ERROR } from 'src/common/error/constants/error.status-code.constant';
import { Response } from 'src/common/response/decorators/response.decorator';
import { RoleService } from 'src/modules/role/services/role.service';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/constants/user.status-code.constant';
import {
    UserDeleteSelfDoc,
    UserSignUpDoc,
} from 'src/modules/user/docs/user.public.doc';
import { UserSignUpDto } from 'src/modules/user/dtos/user.sign-up.dto';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('modules.public.user')
@Controller({
    version: '1',
    path: '/users',
})
export class UserPublicController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly roleService: RoleService
    ) {}

    @UserSignUpDoc()
    @Response('user.signUp')
    @Post('/sign-up')
    async signUp(
        @Body()
        { email, fullName, jobTitle, ...body }: UserSignUpDto
    ): Promise<void> {
        const role: Role = await this.roleService.findOneByName('user');

        const emailExist: boolean = await this.userService.existByEmail(email);
        if (emailExist) {
            throw new ConflictException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR,
                message: 'user.error.emailExist',
            });
        }

        try {
            const password = await this.authService.createPassword(
                body.password
            );

            await this.userService.create(
                { email, fullName, jobTitle, ...body, role: role.id },
                password
            );

            return;
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    @UserDeleteSelfDoc()
    @Response('user.deleteSelf')
    @AuthJwtPublicAccessProtected()
    @Delete('/')
    async deleteSelf(@AuthJwtPayload('id') id: string): Promise<void> {
        try {
            const user: User = await this.userService.findOneById(id);

            await this.userService.inactive(user.id);
        } catch (err: any) {
            throw new InternalServerErrorException({
                statusCode: ENUM_ERROR_STATUS_CODE_ERROR.ERROR_UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }
}
