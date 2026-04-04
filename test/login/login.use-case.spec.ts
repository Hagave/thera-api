import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ValidationException } from '@shared/exceptions/validation.exception';

import { InMemoryUserRepository } from '@infrastructure/repositories/in-memory/in-memory.user.repository';
import { LoginUseCase } from '@application/usecases/login/login.use-case';
import { makeUser } from 'test/user/factory/make-user.factory';

describe('LoginUseCase', () => {
  let userRepository: InMemoryUserRepository;

  let refreshTokenRepository: {
    save: ReturnType<typeof vi.fn>;
  };

  let hashService: {
    compare: ReturnType<typeof vi.fn>;
  };

  let tokenService: {
    generateAccessToken: ReturnType<typeof vi.fn>;
    generateRefreshToken: ReturnType<typeof vi.fn>;
    getRefreshTokenExpiresIn: ReturnType<typeof vi.fn>;
  };

  let useCase: LoginUseCase;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();

    refreshTokenRepository = {
      save: vi.fn(),
    };

    hashService = {
      compare: vi.fn(),
    };

    tokenService = {
      generateAccessToken: vi.fn(),
      generateRefreshToken: vi.fn(),
      getRefreshTokenExpiresIn: vi.fn(),
    };

    useCase = new LoginUseCase(
      userRepository,
      refreshTokenRepository as any,
      hashService as any,
      tokenService as any,
    );
  });

  it('should login successfully', async () => {
    const user = makeUser({
      email: 'john@example.com',
      password: 'hashed-password',
    });

    await userRepository.create(user);

    hashService.compare.mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
    tokenService.getRefreshTokenExpiresIn.mockReturnValue(3600);

    const result = await useCase.execute({
      email: 'john@example.com',
      password: 'plain-password',
    });

    expect(hashService.compare).toHaveBeenCalledWith('plain-password', 'hashed-password');

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
      sub: user.getId(),
      email: 'john@example.com',
      name: user.getName(),
    });

    expect(tokenService.generateRefreshToken).toHaveBeenCalled();

    expect(refreshTokenRepository.save).toHaveBeenCalledWith(user.getId(), 'refresh-token', 3600);

    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: user.getId(),
        name: user.getName(),
        email: 'john@example.com',
      },
    });
  });

  it('should throw if user does not exist', async () => {
    await expect(
      useCase.execute({
        email: 'notfound@example.com',
        password: '123',
      }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it('should throw if user is deleted', async () => {
    const user = makeUser({
      email: 'john@example.com',
    });

    user.delete();

    await userRepository.create(user);

    await expect(
      useCase.execute({
        email: 'john@example.com',
        password: '123',
      }),
    ).rejects.toBeInstanceOf(ValidationException);
  });

  it('should throw if password is invalid', async () => {
    const user = makeUser({
      email: 'john@example.com',
      password: 'hashed-password',
    });

    await userRepository.create(user);

    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'john@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(ValidationException);

    expect(hashService.compare).toHaveBeenCalled();
  });

  it('should not generate tokens if password is invalid', async () => {
    const user = makeUser({
      email: 'john@example.com',
      password: 'hashed-password',
    });

    await userRepository.create(user);

    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'john@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(ValidationException);

    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).not.toHaveBeenCalled();
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });
});
