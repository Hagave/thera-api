import { CreateUserUseCase } from '@application/user/use-cases/create/create-user.use-case';
import { DeleteUserUseCase } from '@application/user/use-cases/delete/delete-user.use-case';
import { GetUserUseCase } from '@application/user/use-cases/get/get-user.use-case';
import { ListUsersUseCase } from '@application/user/use-cases/list/list-users.use-case';
import { UpdateUserUseCase } from '@application/user/use-cases/update/update-user.use-case';
import { Body, Controller, Post, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
} from '@presentation/dtos/user/create-user.dto';
import { DeleteUserResponseDto } from '@presentation/dtos/user/delete-user.dto';
import { GetUserResponseDto } from '@presentation/dtos/user/get-user.dto';
import { ListUsersQueryDto, ListUsersResponseDto } from '@presentation/dtos/user/list-users.dto';
import {
  UpdateUserRequestDto,
  UpdateUserResponseDto,
} from '@presentation/dtos/user/update-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

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

  @Get()
  @ApiOperation({ summary: 'List all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: ListUsersResponseDto,
  })
  async list(@Query() query: ListUsersQueryDto): Promise<ListUsersResponseDto> {
    const output = await this.listUsersUseCase.execute({
      page: query.page || 1,
      limit: query.limit || 10,
    });

    return output;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: GetUserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(@Param('id') id: string): Promise<GetUserResponseDto> {
    const output = await this.getUserUseCase.execute({ id });

    return {
      id: output.id,
      name: output.name,
      email: output.email,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UpdateUserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid input or weak password' })
  @ApiResponse({ status: 422, description: 'Email already exists' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<UpdateUserResponseDto> {
    const output = await this.updateUserUseCase.execute({
      id,
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });

    return {
      id: output.id,
      name: output.name,
      email: output.email,
      updatedAt: output.updatedAt,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: DeleteUserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string): Promise<DeleteUserResponseDto> {
    const output = await this.deleteUserUseCase.execute({ id });

    return output;
  }
}
