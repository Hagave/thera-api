import { NotFoundException } from '@shared/exceptions/not-found.exception';

export class ProductNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super('Product', identifier);
  }
}
