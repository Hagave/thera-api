import { LoginUseCase } from '@application/usecases/login/login.use-case';
import { LogoutUseCase } from '@application/usecases/logout/logout.use-case';
import { RefreshTokenUseCase } from '@application/usecases/refresh-token/refresh-token.use-case';
import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginRequestDto, LoginResponseDto } from '@presentation/dtos/auth/login.dto';
import { LogoutRequestDto, LogoutResponseDto } from '@presentation/dtos/auth/logout.dto';
import {
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from '@presentation/dtos/auth/refresh-token.dto';
import { JwtAuthGuard } from '@presentation/guards/jwt-auth.guard';
import { CurrentUser, ICurrentUser } from '@shared/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return await this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    return await this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful', type: LogoutResponseDto })
  async logout(@Body() dto: LogoutRequestDto): Promise<LogoutResponseDto> {
    return await this.logoutUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@CurrentUser() user: ICurrentUser) {
    return user;
  }
}
