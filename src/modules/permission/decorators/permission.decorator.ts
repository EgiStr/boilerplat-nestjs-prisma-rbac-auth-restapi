import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Permission } from '@prisma/client';

export const GetPermission = createParamDecorator(
    (returnPlain: boolean, ctx: ExecutionContext): Permission => {
        const { __permission } = ctx.switchToHttp().getRequest();
        return returnPlain ? __permission.toObject() : __permission;
    }
);
