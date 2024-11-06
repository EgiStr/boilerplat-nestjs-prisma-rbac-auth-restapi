import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import { RouterModule } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { UserService } from 'src/modules/user/services/user.service';
import { AuthService } from 'src/common/auth/services/auth.service';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { CommonModule } from 'src/common/common.module';
import { RoutesModule } from 'src/router/routes/routes.module';
import { E2E_USER_REFRESH_URL } from './user.constant';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/constants/user.status-code.constant';
import { RoleService } from 'src/modules/role/services/role.service';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant';
import { RoleModule } from 'src/modules/role/role.module';
import { PermissionModule } from 'src/modules/permission/permission.module';
import { Role, User } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('E2E User Refresh', () => {
    let app: INestApplication;
    let userService: UserService;
    let authService: AuthService;
    let roleService: RoleService;
    let helperDateService: HelperDateService;

    const password = `@!${faker.person.firstName().toLowerCase()}${faker.person
        .firstName()
        .toUpperCase()}${faker.number.int({ min: 1, max: 99 })}`;

    let user: User;
    let role: Role;
    let passwordExpired: Date;
    let passwordExpiredForward: Date;

    let refreshToken: string;
    let refreshTokenNotFound: string;

    beforeAll(async () => {
        process.env.AUTH_JWT_PAYLOAD_ENCRYPT = 'false';

        const modRef = await Test.createTestingModule({
            imports: [
                CommonModule,
                RoleModule,
                PermissionModule,
                RoutesModule,
                RouterModule.register([
                    {
                        path: '/',
                        module: RoutesModule,
                    },
                ]),
            ],
        }).compile();

        app = modRef.createNestApplication();
        useContainer(app.select(CommonModule), { fallbackOnErrors: true });
        userService = app.get(UserService);
        authService = app.get(AuthService);
        roleService = app.get(RoleService);
        helperDateService = app.get(HelperDateService);

        role = await roleService.findOneByName('user');

        passwordExpired = helperDateService.backwardInDays(5);
        passwordExpiredForward = helperDateService.forwardInDays(5);

        const passwordHash = await authService.createPassword(password);

        user = await userService.create(
            {
                fullName: faker.person.fullName(),
                password: password,
                email: faker.internet.email(),
                jobTitle: faker.person.jobTitle(),
                role: `${role.id}`,
            },
            passwordHash
        );

        const userPopulate = await userService.findOneById(user.id, {
            include: {
                roles: true,
            },
            where: { id: user.id },
        });

        const map = await userService.payloadSerialization(userPopulate);
        const payload = await authService.createPayloadRefreshToken(
            map.id,
            false
        );
        const payloadNotFound = {
            ...payload,
            id: `${randomUUID()}`,
        };

        refreshToken = await authService.createRefreshToken(payload, {
            rememberMe: false,
            notBeforeExpirationTime: '0',
        });
        refreshTokenNotFound = await authService.createRefreshToken(
            payloadNotFound,
            {
                rememberMe: false,
                notBeforeExpirationTime: '0',
            }
        );

        await app.init();
    });

    afterAll(async () => {
        jest.clearAllMocks();

        try {
            await userService.deleteMany({ id: user.id });
        } catch (err: any) {
            console.error(err);
        }

    });

    it(`POST ${E2E_USER_REFRESH_URL} Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_USER_REFRESH_URL)
            .set('Authorization', `Bearer ${refreshTokenNotFound}`);
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR
        );
    });

    it(`POST ${E2E_USER_REFRESH_URL} Blocked`, async () => {
        await userService.blocked(user.id);

        const response = await request(app.getHttpServer())
            .post(E2E_USER_REFRESH_URL)
            .set('Authorization', `Bearer ${refreshToken}`);

        await userService.unblocked(user.id);

        expect(response.status).toEqual(HttpStatus.FORBIDDEN);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_BLOCKED_ERROR
        );
    });

    it(`POST ${E2E_USER_REFRESH_URL} Inactive`, async () => {
        await userService.inactive(user.id);

        const response = await request(app.getHttpServer())
            .post(E2E_USER_REFRESH_URL)
            .set('Authorization', `Bearer ${refreshToken}`);

        await userService.active(user.id);

        expect(response.status).toEqual(HttpStatus.FORBIDDEN);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_INACTIVE_ERROR
        );
    });

    it(`POST ${E2E_USER_REFRESH_URL} Role Inactive`, async () => {
        await roleService.inactive(role.id);

        const response = await request(app.getHttpServer())
            .post(E2E_USER_REFRESH_URL)
            .set('Authorization', `Bearer ${refreshToken}`);

        await roleService.active(role.id);

        expect(response.status).toEqual(HttpStatus.FORBIDDEN);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_INACTIVE_ERROR
        );
    });

    it(`POST ${E2E_USER_REFRESH_URL} Password Expired`, async () => {
        await userService.updatePasswordExpired(user.id, passwordExpired);

        const response = await request(app.getHttpServer())
            .post(E2E_USER_REFRESH_URL)
            .set('Authorization', `Bearer ${refreshToken}`);

        await userService.updatePasswordExpired(
            user.id,
            passwordExpiredForward
        );

        expect(response.status).toEqual(HttpStatus.FORBIDDEN);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_PASSWORD_EXPIRED_ERROR
        );
    });

    it(`POST ${E2E_USER_REFRESH_URL} Success`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_USER_REFRESH_URL)
            .set('Authorization', `Bearer ${refreshToken}`);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);
    });
});

describe('E2E User Refresh Payload Encryption', () => {
    let app: INestApplication;
    let userService: UserService;
    let authService: AuthService;
    let roleService: RoleService;

    const password = `@!${faker.person.firstName().toLowerCase()}${faker.person
        .firstName()
        .toUpperCase()}${faker.number.int({ min: 1, max: 99 })}`;

    let user: User;

    let refreshToken: string;

    beforeAll(async () => {
        process.env.AUTH_JWT_PAYLOAD_ENCRYPT = 'true';

        const modRef = await Test.createTestingModule({
            imports: [
                CommonModule,
                RoleModule,
                PermissionModule,
                RoutesModule,
                RouterModule.register([
                    {
                        path: '/',
                        module: RoutesModule,
                    },
                ]),
            ],
        }).compile();

        app = modRef.createNestApplication();
        useContainer(app.select(CommonModule), { fallbackOnErrors: true });
        userService = app.get(UserService);
        authService = app.get(AuthService);
        roleService = app.get(RoleService);

        const role: Role = await roleService.findOneByName('user');

        const passwordHash = await authService.createPassword(password);

        user = await userService.create(
            {
                fullName: faker.person.fullName(),
                password: password,
                email: faker.internet.email(),
                jobTitle: faker.person.jobTitle(),
                role: `${role.id}`,
            },
            passwordHash
        );

        const userPopulate = await userService.findOneById(user.id, {
            include: {
                roles: true,
            },
            where: { id: user.id },
        });

        const map = await userService.payloadSerialization(userPopulate);
        const payload = await authService.createPayloadRefreshToken(
            map.id,
            false
        );

        const payloadHashedRefreshToken: string =
            await authService.encryptRefreshToken(payload);

        refreshToken = await authService.createRefreshToken(
            payloadHashedRefreshToken,
            {
                rememberMe: true,
                notBeforeExpirationTime: '0',
            }
        );

        await app.init();
    });

    it(`POST ${E2E_USER_REFRESH_URL} Success`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_USER_REFRESH_URL)
            .set('Authorization', `Bearer ${refreshToken}`);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);
    });
});
