export interface IListUsersInput {
  page: number;
  limit: number;
}

export interface IListUsersOutput {
  users: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
