import { ValidationException } from '@shared/exceptions/validation.exception';
export class WeakPasswordException extends ValidationException {
  constructor() {
    super(
      'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
    );
  }
}
