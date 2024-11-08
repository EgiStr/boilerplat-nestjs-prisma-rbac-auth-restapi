import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { UserGetSerialization } from './user.get.serialization';

export class UserListSerialization extends OmitType(UserGetSerialization, [
    'role',
    'passwordExpired',
    'passwordCreated',
    'passwordAttempt',
    'signUpDate',
    'inactiveDate',
    'blockedDate',
] as const) {
    @Exclude()
    readonly role: string;

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
}
