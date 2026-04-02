import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateUserRequestDto {
  @ApiPropertyOptional({ example: 'John Doe Updated' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'newemail@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'NewSecurePass@123', minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UpdateUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  updatedAt: Date;
}
