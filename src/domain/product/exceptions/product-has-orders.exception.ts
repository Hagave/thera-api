import { BusinessRuleException } from '@shared/exceptions/business-rule.exception';

export class ProductHasOrdersException extends BusinessRuleException {
  constructor(productId: string) {
    super(`Cannot delete product ${productId} because it has associated orders`);
  }
}
