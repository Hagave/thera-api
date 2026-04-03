import { BusinessRuleException } from './business-rule.exception';

export class DuplicateRequestException extends BusinessRuleException {
  constructor(public readonly existingResourceId: string) {
    super('Duplicate request detected. Request already processed.');
  }
}
