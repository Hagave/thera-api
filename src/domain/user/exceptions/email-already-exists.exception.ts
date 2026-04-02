import { BusinessRuleException } from '@shared/exceptions/business-rule.exception';

export class EmailAlreadyExistsException extends BusinessRuleException {
  constructor(email: string) {
    super(`Email '${email}' is already in use`);
  }
}
