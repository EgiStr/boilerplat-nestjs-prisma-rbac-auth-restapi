import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class UserPayloadPutToRequestGuard implements CanActivate {
    constructor(private readonly userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user } = request;

        const check: User = await this.userService.findOneById(user.id, {
            include: { roles: true },
            where: { id: user.id },
        });
        request.__user = check;

        return true;
    }
}
