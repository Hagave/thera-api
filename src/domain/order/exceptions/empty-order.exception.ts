import { ValidationException } from '@shared/exceptions/validation.exception';

export class EmptyOrderException extends ValidationException {
  constructor() {
    super('Order must contain at least one item');
  }
}
