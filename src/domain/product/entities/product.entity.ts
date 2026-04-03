import { Money } from '@shared/value-objects/money.vo';

export class Product {
  private id: string;
  private name: string;
  private category: string;
  private description: string;
  private price: Money;
  private stock: number;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt?: Date;

  constructor(props: {
    id: string;
    name: string;
    category: string;
    description: string;
    price: Money;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.category = props.category;
    this.description = props.description;
    this.price = props.price;
    this.stock = props.stock;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCategory(): string {
    return this.category;
  }

  getDescription(): string {
    return this.description;
  }

  getPrice(): Money {
    return this.price;
  }

  getStock(): number {
    return this.stock;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  // Setters
  setName(name: string): void {
    this.name = name;
    this.touch();
  }

  setCategory(category: string): void {
    this.category = category;
    this.touch();
  }

  setDescription(description: string): void {
    this.description = description;
    this.touch();
  }

  setPrice(price: Money): void {
    this.price = price;
    this.touch();
  }

  setStock(stock: number): void {
    if (stock < 0) {
      throw new Error('Stock cannot be negative');
    }
    this.stock = stock;
    this.touch();
  }

  decreaseStock(quantity: number): void {
    if (quantity > this.stock) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
    this.touch();
  }

  increaseStock(quantity: number): void {
    this.stock += quantity;
    this.touch();
  }

  delete(): void {
    this.deletedAt = new Date();
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
