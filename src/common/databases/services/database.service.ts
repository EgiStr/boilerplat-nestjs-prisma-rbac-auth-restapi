import { PrismaClient, Prisma } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService
    extends PrismaClient<Prisma.PrismaClientOptions, string>
    implements OnModuleInit
{
    constructor() {
        super({
            log: [
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'query',
                },
            ],
        });
    }

    onModuleInit() {
        this.$on('query', (e) => {
            console.log('Query: ' + e.query);
            console.log('Duration: ' + e.duration + 'ms');
        });

        this.$on('info', (e) => {
            console.log('Info: ' + e.message);
        });

        this.$on('warn', (e) => {
            console.log('Warn: ' + e.message);
        });

        this.$on('error', (e) => {
            console.log('Error: ' + e.message);
        });

        this.$connect();
    }
}
