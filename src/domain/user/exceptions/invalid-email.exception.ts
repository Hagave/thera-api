import { ValidationException } from '@shared/exceptions/validation.exception';
export class InvalidEmailException extends ValidationException {
  constructor(email: string) {
    super(`Email '${email}' is invalid`);
  }
}
