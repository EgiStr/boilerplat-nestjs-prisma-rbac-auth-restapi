import {
    applyDecorators,
    createParamDecorator,
    ExecutionContext,
    UseGuards,
} from '@nestjs/common';
import { Setting } from '@prisma/client';
import { SettingNotFoundGuard } from 'src/common/setting/guards/setting.not-found.guard';
import {
    SettingPutToRequestByNameGuard,
    SettingPutToRequestGuard,
} from 'src/common/setting/guards/setting.put-to-request.guard';

export const GetSetting = createParamDecorator(
    (returnPlain: boolean, ctx: ExecutionContext): Setting => {
        const { __setting } = ctx.switchToHttp().getRequest();
        return returnPlain ? __setting.toObject() : __setting;
    }
);

export function SettingGetGuard(): MethodDecorator {
    return applyDecorators(
        UseGuards(SettingPutToRequestGuard, SettingNotFoundGuard)
    );
}

export function SettingGetByNameGuard(): MethodDecorator {
    return applyDecorators(
        UseGuards(SettingPutToRequestByNameGuard, SettingNotFoundGuard)
    );
}
