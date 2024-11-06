import { Module } from '@nestjs/common';
import { AwsModule } from 'src/common/aws/aws.module';
import { HealthAwsS3Indicator } from 'src/health/indicators/health.aws-s3.indicator';
import { HealthPrismaIndicator } from './indicators/health.prisma.indicator';
import { DatabaseModule } from 'src/common/databases/database.module';

@Module({
    providers: [HealthAwsS3Indicator, HealthPrismaIndicator],
    exports: [HealthAwsS3Indicator, HealthPrismaIndicator],
    imports: [AwsModule, DatabaseModule],
})
export class HealthModule {}
