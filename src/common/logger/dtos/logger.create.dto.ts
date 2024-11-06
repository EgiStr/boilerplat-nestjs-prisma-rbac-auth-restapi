import { ENUM_AUTH_ACCESS_FOR } from 'src/common/auth/constants/auth.enum.constant';
import {
    ENUM_LOGGER_ACTION,
    ENUM_LOGGER_LEVEL,
} from 'src/common/logger/constants/logger.enum.constant';
import { ENUM_REQUEST_METHOD } from 'src/common/request/constants/request.enum.constant';

export class LoggerCreateDto {
    action: ENUM_LOGGER_ACTION;
    description: string;
    user?: string;
    requestId?: string;
    method: ENUM_REQUEST_METHOD;
    path: string;
    role?: string;
    accessFor?: ENUM_AUTH_ACCESS_FOR;
    tags?: string[];
    params?: string | Record<string, unknown>;
    bodies?: string | Record<string, unknown>;
    statusCode?: number;
}

export class LoggerCreateRawDto extends LoggerCreateDto {
    level: ENUM_LOGGER_LEVEL;
}
