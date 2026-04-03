import { BusinessRuleException } from '@shared/exceptions/business-rule.exception';

export class OrderAlreadyCompletedException extends BusinessRuleException {
  constructor() {
    super('Order is already completed and cannot be modified');
  }
}
