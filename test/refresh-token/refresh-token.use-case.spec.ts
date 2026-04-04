import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';
import { RefreshTokenUseCase } from '@application/usecases/refresh-token/refresh-token.use-case';
import { TokenService } from '@application/auth/services/token.service';
import { InMemoryUserRepository } from '@infrastructure/repositories/in-memory/in-memory.user.repository';
import { InMemoryRefreshTokenRepository } from '@infrastructure/repositories/in-memory/in-memory.refresh-token.repository';
import { makeUser } from 'test/user/factory/make-user.factory';

let userRepository: InMemoryUserRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let tokenService: TokenService;
let useCase: RefreshTokenUseCase;

describe('RefreshTokenUseCase', () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenService = {
      generateAccessToken: vi.fn().mockReturnValue('new-access-token'),
      generateRefreshToken: vi.fn().mockReturnValue('new-refresh-token'),
      getRefreshTokenExpiresIn: vi.fn().mockReturnValue(3600),
    } as any;

    useCase = new RefreshTokenUseCase(userRepository, refreshTokenRepository, tokenService);
  });

  it('should refresh tokens successfully', async () => {
    const user = makeUser();
    await userRepository.create(user);

    await refreshTokenRepository.save(user.getId(), 'old-refresh-token', 3600);

    const result = await useCase.execute({ refreshToken: 'old-refresh-token' });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');

    const found = await refreshTokenRepository.findByToken('old-refresh-token');
    expect(found).toBeNull();

    const newTokenUserId = await refreshTokenRepository.findByToken('new-refresh-token');
    expect(newTokenUserId).toBe(user.getId());
  });

  it('should throw ValidationException if token is invalid', async () => {
    await expect(useCase.execute({ refreshToken: 'invalid-token' })).rejects.toThrow(
      ValidationException,
    );
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    await refreshTokenRepository.save('non-existent-user', 'token', 3600);

    await expect(useCase.execute({ refreshToken: 'token' })).rejects.toThrow(UserNotFoundException);
  });
});
