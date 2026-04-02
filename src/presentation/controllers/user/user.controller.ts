import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserUseCase } from '@application/user/use-cases/create/create-user.use-case';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from '@presentation/dtos/user/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or weak password' })
  @ApiResponse({ status: 422, description: 'Email already exists' })
  async create(@Body() dto: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const output = await this.createUserUseCase.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });

    return {
      id: output.id,
      name: output.name,
      email: output.email,
      createdAt: output.createdAt,
    };
  }
}
