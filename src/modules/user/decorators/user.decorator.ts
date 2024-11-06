import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
    (returnPlain: boolean, ctx: ExecutionContext): User => {
        const { __user } = ctx.switchToHttp().getRequest();
        return returnPlain ? __user.toObject() : __user;
    }
);
