import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export const GetRole = createParamDecorator(
    (returnPlain: boolean, ctx: ExecutionContext): Role => {
        const { __role } = ctx.switchToHttp().getRequest();
        return returnPlain ? __role.toObject() : __role;
    }
);
