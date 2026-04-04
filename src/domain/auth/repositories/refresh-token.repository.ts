export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

export interface IRefreshTokenRepository {
  save(userId: string, token: string, expiresIn: number): Promise<void>;
  findByToken(token: string): Promise<string | null>;
  delete(token: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
}
