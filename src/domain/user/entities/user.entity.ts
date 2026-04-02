import { Email } from '@shared/value-objects/email.vo';

export class User {
  private id: string;
  private name: string;
  private email: Email;
  private password: string;
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt?: Date;

  constructor(props: {
    id: string;
    name: string;
    email: Email;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
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

  getEmail(): Email {
    return this.email;
  }

  getPassword(): string {
    return this.password;
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

  // Setters
  setName(name: string): void {
    this.name = name;
    this.touch();
  }

  setEmail(email: Email): void {
    this.email = email;
    this.touch();
  }

  setPassword(password: string): void {
    this.password = password;
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
