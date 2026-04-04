import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SecurePass@123',
    description: 'User password (min 8 chars, uppercase, lowercase, number, special char)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class CreateUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  createdAt!: Date;
}
