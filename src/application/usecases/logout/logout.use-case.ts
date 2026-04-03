import { Inject, Injectable } from '@nestjs/common';

import { ILogoutInput, ILogoutOutput } from './logout.use-case.dto';
import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@domain/auth/repositories/refresh-token.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: ILogoutInput): Promise<ILogoutOutput> {
    await this.refreshTokenRepository.delete(input.refreshToken);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
