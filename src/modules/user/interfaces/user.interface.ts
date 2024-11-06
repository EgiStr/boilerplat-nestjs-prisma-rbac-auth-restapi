import { Role, User } from '@prisma/client';

export interface IUser extends Omit<User, 'role'> {
    roles: Role;
}
