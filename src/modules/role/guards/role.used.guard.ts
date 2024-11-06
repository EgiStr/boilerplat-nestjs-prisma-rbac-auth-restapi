import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class RoleUsedGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { __role } = context.switchToHttp().getRequest();
        const check: User = await this.userService.findOne(
            {
                role: __role.id,
            }
        );

        if (check) {
            throw new BadRequestException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_USED_ERROR,
                message: 'role.error.used',
            });
        }

        return true;
    }
}
