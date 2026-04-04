import { Inject, Injectable } from '@nestjs/common';
import { IRefreshTokenInput, IRefreshTokenOutput } from './refresh-token.use-case.dto';
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@domain/auth/repositories/refresh-token.repository';
import { IUserRepository, USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { TokenService } from '@application/auth/services/token.service';
import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: IRefreshTokenInput): Promise<IRefreshTokenOutput> {
    const userId = await this.refreshTokenRepository.findByToken(input.refreshToken);

    if (!userId) {
      throw new ValidationException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(userId);

    if (!user || user.isDeleted()) {
      throw new UserNotFoundException(userId);
    }

    await this.refreshTokenRepository.delete(input.refreshToken);

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.getId(),
      email: user.getEmail().getValue(),
      name: user.getName(),
    });

    const newRefreshToken = this.tokenService.generateRefreshToken();

    const expiresIn = this.tokenService.getRefreshTokenExpiresIn();
    await this.refreshTokenRepository.save(user.getId(), newRefreshToken, expiresIn);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
