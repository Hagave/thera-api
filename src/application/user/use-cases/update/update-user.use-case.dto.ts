export interface IUpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  password?: string;
}

export interface IUpdateUserOutput {
  id: string;
  name: string;
  email: string;
  updatedAt: Date;
}
