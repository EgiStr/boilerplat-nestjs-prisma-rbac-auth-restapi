import {
    LoggerCreateDto,
    LoggerCreateRawDto,
} from 'src/common/logger/dtos/logger.create.dto';

export interface ILoggerService {
    info(data: LoggerCreateDto): Promise<any>;

    debug(data: LoggerCreateDto): Promise<any>;

    warn(data: LoggerCreateDto): Promise<any>;

    fatal(data: LoggerCreateDto): Promise<any>;

    raw(data: LoggerCreateRawDto): Promise<any>;
}
