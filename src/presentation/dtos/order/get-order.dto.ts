import { ApiProperty } from '@nestjs/swagger';

export class GetOrderItemDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  subtotal!: number;
}

export class GetOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ type: [GetOrderItemDto] })
  items!: GetOrderItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
