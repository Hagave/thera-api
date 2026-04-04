import { ApiProperty } from '@nestjs/swagger';

export class DeleteProductResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  message!: string;
}
