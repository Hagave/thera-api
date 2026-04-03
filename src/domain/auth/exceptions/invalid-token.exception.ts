import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid token');
  }
}
