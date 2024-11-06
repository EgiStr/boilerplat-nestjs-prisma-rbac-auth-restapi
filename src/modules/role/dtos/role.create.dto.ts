import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    MaxLength,
    MinLength,
    IsEnum,
    IsArray,
    IsUUID,
} from 'class-validator';
import {
    ENUM_AUTH_ACCESS_FOR,
    ENUM_AUTH_ACCESS_FOR_DEFAULT,
} from 'src/common/auth/constants/auth.enum.constant';

export class RoleCreateDto {
    @ApiProperty({
        description: 'Alias name of role',
        example: faker.person.jobTitle(),
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @Type(() => String)
    readonly name: string;

    @ApiProperty({
        description: 'List of permission',
        example: [faker.string.uuid(), faker.string.uuid()],
        required: true,
    })
    @IsUUID('4', { each: true })
    @IsArray()
    @IsNotEmpty()
    readonly permissions: string[];

    @ApiProperty({
        description: 'Representative for role',
        example: 'ADMIN',
        required: true,
    })
    @IsEnum(ENUM_AUTH_ACCESS_FOR)
    @IsNotEmpty()
    readonly accessFor: ENUM_AUTH_ACCESS_FOR;
}

export class RolePermissionDto {
    @ApiProperty({
        description: 'Role ID',
        example: faker.string.uuid(),
        required: true,
    })
    @IsUUID()
    @IsNotEmpty()
    readonly roleId: string;

    @ApiProperty({
        description: 'Permission ID',
        example: faker.string.uuid(),
        required: true,
    })
    @IsUUID()
    @IsNotEmpty()
    readonly permissionId: string;
}
