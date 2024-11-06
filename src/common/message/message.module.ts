import { Global, Module } from '@nestjs/common';
import { MessageService } from './services/message.service';
import { MessageMiddlewareModule } from 'src/common/message/middleware/message.middleware.module';

@Global()
@Module({
    providers: [MessageService],
    exports: [MessageService],
    imports: [MessageMiddlewareModule],
    controllers: [],
})
export class MessageModule {}
