import { Injectable } from '@nestjs/common';
import bytes from 'bytes';
import { IHelperFileService } from 'src/common/helper/interfaces/helper.file-service.interface';

@Injectable()
export class HelperFileService implements IHelperFileService {
    convertToBytes(megabytes: string): number {
        return bytes(megabytes);
    }
}
