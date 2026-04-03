import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

@Injectable()
export class HashService {
  private readonly SALT_ROUNDS = 10;

  async hash(plainText: string): Promise<string> {
    return await hash(plainText, this.SALT_ROUNDS);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return await compare(plainText, hashedText);
  }
}
