export interface ILoginInput {
  email: string;
  password: string;
}

export interface ILoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
