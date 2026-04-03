export interface IListOrdersInput {
  page: number;
  limit: number;
  userId?: string;
}

export interface IListOrdersOutput {
  orders: {
    id: string;
    userId: string;
    totalItems: number;
    total: number;
    status: string;
    createdAt: Date;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
