import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/common/auth/services/auth.service';
import { UserService } from 'src/modules/user/services/user.service';
import { RoleService } from 'src/modules/role/services/role.service';
import { Role, User } from '@prisma/client';

@Injectable()
export class MigrationUserSeed {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly roleService: RoleService
    ) {}

    @Command({
        command: 'seed:user',
        describe: 'seed users',
    })
    async seeds(): Promise<void> {
        const password = 'aaAA@@123444';
        const superadminRole: Role = await this.roleService.findOne({
            name: 'superadmin',
        });
        const authorRole: Role = await this.roleService.findOne({
            name: 'author',
        });
        const userRole: Role = await this.roleService.findOne({
            name: 'user',
        });
        const passwordHash =
            await this.authService.createPassword('aaAA@@123444');

        const user1: Promise<User> = this.userService.create(
            {
                fullName: 'test',
                email: 'superadmin@mail.com',
                password,
                jobTitle: 'admin',
                role: superadminRole.id,
            },
            passwordHash
        );

        const user2: Promise<User> = this.userService.create(
            {
                fullName: 'test',
                email: 'author@mail.com',
                password,
                jobTitle: 'author',
                role: authorRole.id,
            },
            passwordHash
        );

        const user3: Promise<User> = this.userService.create(
            {
                fullName: 'user',
                email: 'user@mail.com',
                password,
                jobTitle: 'user',
                role: userRole.id,
            },
            passwordHash
        );

        try {
            await Promise.all([user1, user2, user3]);
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
    }

    @Command({
        command: 'remove:user',
        describe: 'remove users',
    })
    async remove(): Promise<void> {
        try {
            await this.userService.deleteMany({});
        } catch (err: any) {
            throw new Error(err.message);
        }

        return;
}
}
