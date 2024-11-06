import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
@Module({
    imports: [],
    exports: [UserService],
    providers: [UserService],
    controllers: [],
})
export class UserModule {}
