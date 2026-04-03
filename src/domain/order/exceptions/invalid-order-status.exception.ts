import { BusinessRuleException } from '@shared/exceptions/business-rule.exception';

export class InvalidOrderStatusException extends BusinessRuleException {
  constructor(message: string) {
    super(message);
  }
}
