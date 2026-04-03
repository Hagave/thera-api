import { BusinessRuleException } from '@shared/exceptions/business-rule.exception';

export class ProductAlreadyExistsException extends BusinessRuleException {
  constructor(name: string, category: string) {
    super(`Product '${name}' already exists in category '${category}'`);
  }
}
