import { Inject, Injectable } from '@nestjs/common';
import { IRefreshTokenInput, IRefreshTokenOutput } from './refresh-token.use-case.dto';

import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@domain/auth/repositories/refresh-token.repository';
import { IUserRepository, USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { TokenService } from '@application/auth/services/token.service';
import { InvalidTokenException } from '@domain/auth/exceptions/invalid-token.exception';
import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';
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
    // Buscar userId pelo refresh token
    const userId = await this.refreshTokenRepository.findByToken(input.refreshToken);

    if (!userId) {
      throw new InvalidTokenException();
    }

    // Buscar usuário
    const user = await this.userRepository.findById(userId);

    if (!user || user.isDeleted()) {
      throw new UserNotFoundException(userId);
    }

    // Invalidar refresh token antigo
    await this.refreshTokenRepository.delete(input.refreshToken);

    // Gerar novo par de tokens
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.getId(),
      email: user.getEmail().getValue(),
      name: user.getName(),
    });

    const newRefreshToken = this.tokenService.generateRefreshToken();

    // Salvar novo refresh token
    const expiresIn = this.tokenService.getRefreshTokenExpiresIn();
    await this.refreshTokenRepository.save(user.getId(), newRefreshToken, expiresIn);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
