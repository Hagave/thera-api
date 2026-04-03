export interface ICreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface ICreateOrderInput {
  userId: string;
  items: ICreateOrderItemInput[];
}

export interface ICreateOrderOutput {
  id: string;
  userId: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  total: number;
  status: string;
  createdAt: Date;
}
