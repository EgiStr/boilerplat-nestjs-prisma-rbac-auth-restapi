import { faker } from '@faker-js/faker';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { RoleGetSerialization } from './role.get.serialization';

export class RoleListSerialization extends OmitType(RoleGetSerialization, [
    'permissions',
] as const) {
    @ApiProperty({
        description: 'Count of permissions',
        example: faker.number.int({
            max: 10,
            min: 1,
        }),
        required: true,
    })
    @Transform(({ value }) => value.length)
    readonly permissions: number;
}
