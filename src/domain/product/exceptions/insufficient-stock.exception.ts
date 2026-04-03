import { BusinessRuleException } from '@shared/exceptions/business-rule.exception';

export class InsufficientStockException extends BusinessRuleException {
  constructor(productName: string, available: number, requested: number) {
    super(
      `Insufficient stock for product '${productName}'. Available: ${available}, Requested: ${requested}`,
    );
  }
}
