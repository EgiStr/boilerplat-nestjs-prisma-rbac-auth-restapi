import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import {
    E2E_USER_ADMIN_ACTIVE_URL,
    E2E_USER_ADMIN_BLOCKED_URL,
    E2E_USER_ADMIN_CREATE_URL,
    E2E_USER_ADMIN_DELETE_URL,
    E2E_USER_ADMIN_GET_URL,
    E2E_USER_ADMIN_INACTIVE_URL,
    E2E_USER_ADMIN_LIST_URL,
    E2E_USER_ADMIN_UPDATE_URL,
    E2E_USER_PERMISSION_TOKEN_PAYLOAD_TEST,
} from './user.constant';
import { RouterModule } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { UserService } from 'src/modules/user/services/user.service';
import { AuthService } from 'src/common/auth/services/auth.service';
import { CommonModule } from 'src/common/common.module';
import { RoutesAdminModule } from 'src/router/routes/routes.admin.module';
import { ENUM_REQUEST_STATUS_CODE_ERROR } from 'src/common/request/constants/request.status-code.constant';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/constants/user.status-code.constant';
import { RoleService } from 'src/modules/role/services/role.service';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/constants/role.status-code.constant';
import { Role, User } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('E2E User Admin', () => {
    let app: INestApplication;
    let userService: UserService;
    let authService: AuthService;
    let roleService: RoleService;

    const password = `@!${faker.person.firstName().toLowerCase()}${faker.person
        .firstName()
        .toUpperCase()}${faker.number.int({ min: 1, max: 99 })}`;

    let userData: Record<string, any>;
    let userExist: User;

    let accessToken: string;
    let permissionToken: string;

    beforeAll(async () => {
        process.env.AUTH_JWT_PAYLOAD_ENCRYPT = 'false';

        const modRef = await Test.createTestingModule({
            imports: [
                CommonModule,
                RoutesAdminModule,
                RouterModule.register([
                    {
                        path: '/admin',
                        module: RoutesAdminModule,
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

        userData = {
            fullName: faker.person.fullName(),
            password: password,
            email: faker.internet.email(),
            jobTitle: faker.person.jobTitle(),
            role: `${role.id}`,
        };

        const passwordHash = await authService.createPassword(password);

        userExist = await userService.create(
            {
                fullName: faker.person.fullName(),
                password: password,
                email: faker.internet.email(),
                jobTitle: faker.person.jobTitle(),
                role: `${role.id}`,
            },
            passwordHash
        );

        const user = await userService.findOne(
            {
                email: 'superadmin@mail.com',
            },
            {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    jobTitle: true,
                    roles: true,
                },
            }
        );
        const map = await userService.payloadSerialization(user);
        const payload = await authService.createPayloadAccessToken(map, false);

        accessToken = await authService.createAccessToken(payload);
        permissionToken = await authService.createPermissionToken({
            ...E2E_USER_PERMISSION_TOKEN_PAYLOAD_TEST,
            id: payload.id,
        });

        await app.init();
    });

    afterAll(async () => {
        jest.clearAllMocks();

        try {
            await userService.deleteMany({
                id: { in: [userData.id, userExist.id] },
            });
            await userService.deleteMany({ username: 'test111' });
        } catch (err: any) {
            console.error(err);
        }

    });

    it(`GET ${E2E_USER_ADMIN_LIST_URL} List Success`, async () => {
        const response = await request(app.getHttpServer())
            .get(E2E_USER_ADMIN_LIST_URL)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);
    });

    it(`POST ${E2E_USER_ADMIN_CREATE_URL} Create, Error Request`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_USER_ADMIN_CREATE_URL)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken)
            .send({
                role: 'test_roles',
                accessFor: 'test',
            });

        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.statusCode).toEqual(
            ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR
        );
    });

    it(`POST ${E2E_USER_ADMIN_CREATE_URL} Create, Role Not Found`, async () => {
        const datauser = {
            ...userData,
            role: `${randomUUID()}`,
            password,
        };

        const response = await request(app.getHttpServer())
            .post(E2E_USER_ADMIN_CREATE_URL)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken)
            .send(datauser);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_ROLE_STATUS_CODE_ERROR.ROLE_NOT_FOUND_ERROR
        );
    });

    it(`POST ${E2E_USER_ADMIN_CREATE_URL} Create, Email Exist`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_USER_ADMIN_CREATE_URL)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken)
            .send({
                ...userData,
                email: userExist.email,
                password,
            });

        expect(response.status).toEqual(HttpStatus.CONFLICT);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_EMAIL_EXIST_ERROR
        );
    });

    it(`POST ${E2E_USER_ADMIN_CREATE_URL} Create, Success`, async () => {
        const response = await request(app.getHttpServer())
            .post(E2E_USER_ADMIN_CREATE_URL)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken)
            .send(userData);

        userData = response.body.data;

        expect(response.status).toEqual(HttpStatus.CREATED);
        expect(response.body.statusCode).toEqual(HttpStatus.CREATED);
    });

    it(`GET ${E2E_USER_ADMIN_GET_URL} Get Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .get(E2E_USER_ADMIN_GET_URL.replace(':id', `${randomUUID()}`))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR
        );
    });

    it(`GET ${E2E_USER_ADMIN_GET_URL} Get Success`, async () => {
        const response = await request(app.getHttpServer())
            .get(E2E_USER_ADMIN_GET_URL.replace(':id', userData.id))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);
    });

    it(`PUT ${E2E_USER_ADMIN_UPDATE_URL} Update, Error Request`, async () => {
        const response = await request(app.getHttpServer())
            .put(E2E_USER_ADMIN_UPDATE_URL.replace(':id', userData.id))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken)
            .send({
                firstName: [],
                lastName: 1231231,
            });

        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.statusCode).toEqual(
            ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR
        );
    });

    it(`PUT ${E2E_USER_ADMIN_UPDATE_URL} Update, not found`, async () => {
        const response = await request(app.getHttpServer())
            .put(E2E_USER_ADMIN_UPDATE_URL.replace(':id', `${randomUUID()}`))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken)
            .send({
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
            });

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR
        );
    });

    it(`PUT ${E2E_USER_ADMIN_UPDATE_URL} Update, success`, async () => {
        const response = await request(app.getHttpServer())
            .put(E2E_USER_ADMIN_UPDATE_URL.replace(':id', userData.id))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken)
            .send({
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
            });

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);
    });

    it(`PATCH ${E2E_USER_ADMIN_INACTIVE_URL} Inactive, Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .patch(
                E2E_USER_ADMIN_INACTIVE_URL.replace(':id', `${randomUUID()}`)
            )
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR
        );
    });

    it(`PATCH ${E2E_USER_ADMIN_INACTIVE_URL} Inactive, success`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_USER_ADMIN_INACTIVE_URL.replace(':id', userData.id))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);
    });

    it(`PATCH ${E2E_USER_ADMIN_INACTIVE_URL} Inactive, already inactive`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_USER_ADMIN_INACTIVE_URL.replace(':id', userData.id))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_IS_ACTIVE_ERROR
        );
    });

    it(`PATCH ${E2E_USER_ADMIN_ACTIVE_URL} Active, Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_USER_ADMIN_ACTIVE_URL.replace(':id', `${randomUUID()}`))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR
        );
    });

    it(`PATCH ${E2E_USER_ADMIN_ACTIVE_URL} Active, success`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_USER_ADMIN_ACTIVE_URL.replace(':id', userData.id))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);
    });

    it(`PATCH ${E2E_USER_ADMIN_ACTIVE_URL} Active, already active`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_USER_ADMIN_ACTIVE_URL.replace(':id', userData.id))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_IS_ACTIVE_ERROR
        );
    });

    it(`PATCH ${E2E_USER_ADMIN_BLOCKED_URL} Blocked, Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_USER_ADMIN_BLOCKED_URL.replace(':id', `${randomUUID()}`))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR
        );
    });

    it(`PATCH ${E2E_USER_ADMIN_BLOCKED_URL} Blocked, success`, async () => {
        const response = await request(app.getHttpServer())
            .patch(E2E_USER_ADMIN_BLOCKED_URL.replace(':id', userData.id))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.statusCode).toEqual(HttpStatus.OK);
    });

    it(`DELETE ${E2E_USER_ADMIN_DELETE_URL} Delete, Not Found`, async () => {
        const response = await request(app.getHttpServer())
            .delete(E2E_USER_ADMIN_DELETE_URL.replace(':id', `${randomUUID()}`))
            .set('Authorization', `Bearer ${accessToken}`)
            .set('x-permission-token', permissionToken);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.statusCode).toEqual(
            ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR
        );
    });
});
