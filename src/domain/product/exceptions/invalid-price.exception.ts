import { ValidationException } from '@shared/exceptions/validation.exception';

export class InvalidPriceException extends ValidationException {
  constructor() {
    super('Price must be greater than zero');
  }
}
