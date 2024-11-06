import { faker } from '@faker-js/faker';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';
import { UserGetSerialization } from 'src/modules/user/serializations/user.get.serialization';

export class UserPayloadSerialization extends OmitType(UserGetSerialization, [
    'id',
    'role',
    'isActive',
    'blocked',
    'email',
    'passwordExpired',
    'passwordCreated',
    'passwordAttempt',
    'signUpDate',
    'inactiveDate',
    'blockedDate',
    'createdAt',
    'updatedAt',
] as const) {
    @ApiProperty({
        example: faker.string.uuid(),
        type: 'string',
        description: 'User id',
    })
    @Transform(({ obj }) => `${obj.id}`)
    readonly id: string;

    @ApiProperty({
        example: faker.string.uuid(),
        type: 'string',
    })
    @Transform(({ obj }) => `${obj.role.id}`)
    readonly role: string;

    @ApiProperty({
        example: ENUM_AUTH_ACCESS_FOR.SUPER_ADMIN,
        type: 'string',
        enum: ENUM_AUTH_ACCESS_FOR,
    })
    @Expose()
    @Transform(({ obj }) => obj.role.accessFor)
    readonly accessFor: ENUM_AUTH_ACCESS_FOR;

    @Exclude()
    readonly isActive: boolean;

    @Exclude()
    readonly blocked: boolean;

    @Exclude()
    readonly passwordExpired: Date;

    @Exclude()
    readonly passwordCreated: Date;

    @Exclude()
    readonly passwordAttempt: number;

    @Exclude()
    readonly signUpDate: Date;

    @Exclude()
    readonly inactiveDate?: Date;

    @Exclude()
    readonly blockedDate?: Date;

    @Exclude()
    readonly email: Date;

    @Exclude()
    readonly jobTitle: string;

    readonly rememberMe: boolean;
    readonly loginDate: Date;

    @Exclude()
    readonly createdAt: number;

    @Exclude()
    readonly updatedAt: number;
}
