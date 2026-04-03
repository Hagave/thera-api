import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super('Token has expired');
  }
}
