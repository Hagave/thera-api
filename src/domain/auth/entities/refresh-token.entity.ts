export class RefreshToken {
  private id: string;
  private userId: string;
  private token: string;
  private expiresAt: Date;
  private createdAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getToken(): string {
    return this.token;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
