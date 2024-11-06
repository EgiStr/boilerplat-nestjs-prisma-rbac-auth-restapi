import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { RoleGetSerialization } from 'src/modules/role/serializations/role.get.serialization';

export class UserGetSerialization {
    @ApiProperty({ example: faker.string.uuid() })
    @Type(() => String)
    readonly id: string;

    @ApiProperty({
        type: () => RoleGetSerialization,
    })
    @Type(() => RoleGetSerialization)
    readonly role: RoleGetSerialization;

    @ApiProperty({
        example: faker.person.jobTitle(),
    })
    readonly jobTitle: string;

    @ApiProperty({
        example: faker.internet.email(),
    })
    readonly email: string;

    @ApiProperty({
        example: true,
    })
    readonly isActive: boolean;

    @ApiProperty({
        example: true,
    })
    readonly inactivePermanent: boolean;

    @ApiProperty({
        required: false,
        nullable: true,
        example: faker.date.recent(),
    })
    readonly inactiveDate?: Date;

    @ApiProperty({
        example: false,
    })
    readonly blocked: boolean;

    @ApiProperty({
        required: false,
        nullable: true,
        example: faker.date.recent(),
    })
    readonly blockedDate?: Date;

    @ApiProperty({
        example: faker.person.fullName(),
    })
    readonly fullName: string;

    @Exclude()
    readonly password: string;

    @ApiProperty({
        example: faker.date.future(),
    })
    readonly passwordExpired: Date;

    @ApiProperty({
        example: faker.date.past(),
    })
    readonly passwordCreated: Date;

    @ApiProperty({
        example: [1, 0],
    })
    readonly passwordAttempt: number;

    @ApiProperty({
        example: faker.date.recent(),
    })
    readonly signUpDate: Date;

    @Exclude()
    readonly salt: string;

    @ApiProperty({
        description: 'Date created at',
        example: faker.date.recent(),
        required: true,
    })
    readonly createdAt: Date;

    @ApiProperty({
        description: 'Date updated at',
        example: faker.date.recent(),
        required: false,
    })
    readonly updatedAt: Date;

}
