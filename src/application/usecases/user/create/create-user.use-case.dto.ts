export interface ICreateUserInput {
  name: string;
  email: string;
  password: string;
  idempotencyKey?: string;
}

export interface ICreateUserOutput {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
