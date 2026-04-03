export interface ICreateProductInput {
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
}

export interface ICreateProductOutput {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
}
