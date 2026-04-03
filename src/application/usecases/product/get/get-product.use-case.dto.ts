export interface IGetProductInput {
  id: string;
}

export interface IGetProductOutput {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}
