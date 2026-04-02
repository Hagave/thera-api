import { ValidationException } from '@shared/exceptions/validation.exception';

export class Money {
  private readonly amount: number;

  constructor(amount: number) {
    if (amount < 0) {
      throw new ValidationException('Money amount cannot be negative');
    }
    // Arredonda para 2 casas decimais
    this.amount = Math.round(amount * 100) / 100;
  }

  getAmount(): number {
    return this.amount;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.amount);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor);
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    return this.amount < other.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }
}
