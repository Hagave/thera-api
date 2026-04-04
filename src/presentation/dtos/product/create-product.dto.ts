import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, MinLength, MaxLength } from 'class-validator';

export class CreateProductRequestDto {
  @ApiProperty({ example: 'Notebook Dell' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  category!: string;

  @ApiProperty({ example: 'High performance laptop' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description!: string;

  @ApiProperty({ example: 3500.0, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  price!: number;

  @ApiProperty({ example: 10, minimum: 0 })
  @IsNumber()
  @Min(0)
  stock!: number;
}

export class CreateProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  stock!: number;

  @ApiProperty()
  createdAt!: Date;
}
