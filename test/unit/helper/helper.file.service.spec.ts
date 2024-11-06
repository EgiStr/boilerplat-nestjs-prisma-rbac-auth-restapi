import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { HelperModule } from 'src/common/helper/helper.module';
import { HelperFileService } from 'src/common/helper/services/helper.file.service';
import configs from 'src/configs';

describe('HelperFileService', () => {
    let helperFileService: HelperFileService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: configs,
                    isGlobal: true,
                    cache: true,
                    envFilePath: ['.env'],
                    expandVariables: true,
                }),
                HelperModule,
            ],
        }).compile();

        helperFileService = moduleRef.get<HelperFileService>(HelperFileService);
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(helperFileService).toBeDefined();
    });

    describe('convertToBytes', () => {
        it('should be success', async () => {
            const result: number = helperFileService.convertToBytes('1mb');

            jest.spyOn(helperFileService, 'convertToBytes').mockReturnValueOnce(
                result
            );

            expect(result).toBeTruthy();
            expect(result).toBe(1048576);
        });
    });
});
