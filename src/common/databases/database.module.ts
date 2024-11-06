import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/database.service';

@Global()
@Module({
    exports: [PrismaService],
    providers: [PrismaService],
    imports: [],
    controllers: [],
})
export class DatabaseModule {}
