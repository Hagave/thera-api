import { IRefreshTokenRepository } from '@domain/auth/repositories/refresh-token.repository';

interface StoredToken {
  userId: string;
  expiresAt: number;
}

export class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
  private tokens = new Map<string, StoredToken>();

  async save(userId: string, token: string, expiresIn: number): Promise<void> {
    const expiresAt = Date.now() + expiresIn * 1000;
    this.tokens.set(token, { userId, expiresAt });
  }

  async findByToken(token: string): Promise<string | null> {
    const entry = this.tokens.get(token);
    if (!entry) return null;

    // expiração
    if (entry.expiresAt < Date.now()) {
      this.tokens.delete(token);
      return null;
    }

    return entry.userId;
  }

  async delete(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    for (const [token, entry] of this.tokens.entries()) {
      if (entry.userId === userId) {
        this.tokens.delete(token);
      }
    }
  }

  // Apenas para testes
  clear(): void {
    this.tokens.clear();
  }
}
