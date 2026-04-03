export interface IGetOrderInput {
  id: string;
  userId?: string;
}

export interface IGetOrderOutput {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
