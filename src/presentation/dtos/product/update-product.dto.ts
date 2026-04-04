import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateProductRequestDto {
  @ApiPropertyOptional({ example: 'Notebook Dell Updated' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Electronics' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 4000.0, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @ApiPropertyOptional({ example: 15, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class UpdateProductResponseDto {
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
  updatedAt!: Date;
}
