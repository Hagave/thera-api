import { ApiProperty } from '@nestjs/swagger';

export class CompleteOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  updatedAt: Date;
}
