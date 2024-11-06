import { faker } from '@faker-js/faker';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { Transform } from 'class-transformer';
import { UserGetSerialization } from 'src/modules/user/serializations/user.get.serialization';

export class UserPayloadPermissionSerialization extends PickType(
    UserGetSerialization,
    ['id'] as const
) {
    @ApiProperty({
        example: [faker.person.jobTitle(), faker.person.jobTitle()],
        type: 'string',
        isArray: true,
    })
    @Transform(({ value }) => value?.map((val: Permission) => val.code) ?? [])
    readonly permissions: string[];
}
