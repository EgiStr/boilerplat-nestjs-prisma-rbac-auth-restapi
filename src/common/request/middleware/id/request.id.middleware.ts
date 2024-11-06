import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Response, NextFunction } from 'express';
import { IRequestApp } from 'src/common/request/interfaces/request.interface';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    async use(
        req: IRequestApp,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const uuid: string = randomUUID();
        req.__id = uuid;
        next();
    }
}
