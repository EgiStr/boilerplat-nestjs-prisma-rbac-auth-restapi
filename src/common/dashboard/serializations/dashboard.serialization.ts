import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardSerialization {
    @ApiProperty({
        name: 'total',
        example: faker.number.int(),
        description: 'Total user',
        nullable: false,
    })
    total: number;
}
