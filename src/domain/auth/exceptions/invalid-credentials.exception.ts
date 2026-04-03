import { UnauthorizedException } from '@shared/exceptions/unauthorized.exception';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid email or password');
  }
}
