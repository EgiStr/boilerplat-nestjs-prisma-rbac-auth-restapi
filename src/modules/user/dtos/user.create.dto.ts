import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MaxLength,
    IsUUID,
    IsOptional,
} from 'class-validator';
import { IsPasswordStrong } from 'src/common/request/validations/request.is-password-strong.validation';

export class UserCreateDto {
    @ApiProperty({
        example: faker.internet.displayName(),
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Type(() => String)
    readonly fullName: string;

    @ApiProperty({
        example: faker.internet.email(),
        required: true,
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    @Type(() => String)
    readonly email: string;

    @ApiProperty({
        example: faker.string.uuid(),
        required: true,
    })
    @IsNotEmpty()
    @IsUUID('4')
    readonly role: string;

    @ApiProperty({
        example: faker.person.jobTitle(),
        required: false,
        description: 'Job title of user',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Type(() => String)
    readonly jobTitle: string;

    @ApiProperty({
        description: 'string password',
        example: `${faker.string.alphanumeric(5).toLowerCase()}${faker.string
            .alphanumeric(5)
            .toUpperCase()}@@!123`,
        required: true,
    })
    @IsNotEmpty()
    @IsPasswordStrong()
    readonly password: string;
}
