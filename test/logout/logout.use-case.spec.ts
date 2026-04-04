import { LogoutUseCase } from '@application/usecases/logout/logout.use-case';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LogoutUseCase', () => {
  let refreshTokenRepository: {
    delete: ReturnType<typeof vi.fn>;
  };

  let useCase: LogoutUseCase;

  beforeEach(() => {
    refreshTokenRepository = {
      delete: vi.fn(),
    };

    useCase = new LogoutUseCase(refreshTokenRepository as any);
  });

  it('should delete refresh token successfully', async () => {
    await useCase.execute({
      refreshToken: 'valid-refresh-token',
    });

    expect(refreshTokenRepository.delete).toHaveBeenCalledWith('valid-refresh-token');
  });

  it('should return success response', async () => {
    const result = await useCase.execute({
      refreshToken: 'valid-refresh-token',
    });

    expect(result).toEqual({
      success: true,
      message: 'Logged out successfully',
    });
  });

  it('should still return success even if token does not exist', async () => {
    refreshTokenRepository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute({
      refreshToken: 'non-existent-token',
    });

    expect(refreshTokenRepository.delete).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('should call repository only once', async () => {
    await useCase.execute({
      refreshToken: 'valid-refresh-token',
    });

    expect(refreshTokenRepository.delete).toHaveBeenCalledTimes(1);
  });
});
