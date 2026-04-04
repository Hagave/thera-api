import { Inject, Injectable } from '@nestjs/common';
import { ILoginInput, ILoginOutput } from './login.use-case.dto';

import {
  IRefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@domain/auth/repositories/refresh-token.repository';
import { IUserRepository, USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { HashService } from '@application/auth/services/hash.service';
import { TokenService } from '@application/auth/services/token.service';
import { ValidationException } from '@shared/exceptions/validation.exception';
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: ILoginInput): Promise<ILoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || user.isDeleted()) {
      throw new ValidationException('Invalid email or password');
    }

    const isPasswordValid = await this.hashService.compare(input.password, user.getPassword());

    if (!isPasswordValid) {
      throw new ValidationException('Invalid email or password');
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.getId(),
      email: user.getEmail().getValue(),
      name: user.getName(),
    });

    const refreshToken = this.tokenService.generateRefreshToken();

    const expiresIn = this.tokenService.getRefreshTokenExpiresIn();
    await this.refreshTokenRepository.save(user.getId(), refreshToken, expiresIn);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
      },
    };
  }
}
