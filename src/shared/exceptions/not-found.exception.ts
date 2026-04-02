import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(entity: string, identifier: string) {
    super(`${entity} with identifier '${identifier}' not found`);
  }
}
