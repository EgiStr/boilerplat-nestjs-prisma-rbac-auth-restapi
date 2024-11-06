import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class UserPutToRequestGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { params } = request;
        const { user } = params;

        const check: User = await this.userService.findOneById(user, {
            include: {
                roles: true,
            },
            where: {
                id: user,
            },
        });
        request.__user = check;

        return true;
    }
}
