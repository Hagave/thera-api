import { ValidationException } from '@shared/exceptions/validation.exception';

export class InvalidStockException extends ValidationException {
  constructor() {
    super('Stock cannot be negative');
  }
}
