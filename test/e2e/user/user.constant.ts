import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';

export const E2E_USER_ADMIN_LIST_URL = '/admin/users/';
export const E2E_USER_ADMIN_GET_URL = '/admin/users/:id';
export const E2E_USER_ADMIN_ACTIVE_URL = '/admin/users/:id/active';
export const E2E_USER_ADMIN_INACTIVE_URL = '/admin/users/:id/inactive';
export const E2E_USER_ADMIN_CREATE_URL = '/admin/users/';
export const E2E_USER_ADMIN_UPDATE_URL = '/admin/users/:id';
export const E2E_USER_ADMIN_DELETE_URL = '/admin/users/:id';
export const E2E_USER_ADMIN_BLOCKED_URL = '/admin/users/:id/blocked';

export const E2E_USER_PROFILE_URL = '/users/profile';
export const E2E_USER_LOGIN_URL = '/users/login';
export const E2E_USER_REFRESH_URL = '/users/refresh';
export const E2E_USER_CHANGE_PASSWORD_URL = '/users/change-password';
export const E2E_USER_INFO = '/users/info';
export const E2E_USER_GRANT_PERMISSION = '/users/grant-permission';

export const E2E_USER_PUBLIC_SIGN_UP_URL = '/public/users/sign-up';
export const E2E_USER_PUBLIC_DELETE_URL = '/public/users/';

export const E2E_USER_ACCESS_TOKEN_PAYLOAD_TEST = {
    role: '613ee8e5b2fdd012b94484cb',
    accessFor: ENUM_AUTH_ACCESS_FOR.SUPER_ADMIN,
    phoneNumber: '628123123112',
    email: 'test@kadence.com',
    id: '613ee8e5b2fdd012b94484ca',
    rememberMe: false,
    loginWith: 'EMAIL',
    loginDate: '2021-9-13',
};

export const E2E_USER_PERMISSION_TOKEN_PAYLOAD_TEST = {
    permissions: [],
    id: '613ee8e5b2fdd012b94484ca',
};
