import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

export class OrderNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super('Order', identifier);
  }
}
