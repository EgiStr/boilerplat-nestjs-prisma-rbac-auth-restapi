import { PrismaClientOptions } from '@prisma/client/runtime/library';

export interface IDatabaseOptionsService {
    createOptions(): PrismaClientOptions;
}
