import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user.module';
import { AuthController } from '@presentation/controllers/auth/auth.controller';
import { LoginUseCase } from '@application/usecases/login/login.use-case';
import { RedisTokenRepository } from '@infrastructure/cache/repositories/redis-token.repository';
import { REFRESH_TOKEN_REPOSITORY } from '@domain/auth/repositories/refresh-token.repository';
import { JwtStrategy } from '@infrastructure/auth/strategies/jwt.strategy';
import { TokenService } from '@application/auth/services/token.service';
import { HashService } from '@application/auth/services/hash.service';
import { LogoutUseCase } from '@application/usecases/logout/logout.use-case';
import { RefreshTokenUseCase } from '@application/usecases/refresh-token/refresh-token.use-case';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '15m') as any,
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    HashService,
    TokenService,
    JwtStrategy,
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RedisTokenRepository,
    },
  ],
})
export class AuthModule {}
