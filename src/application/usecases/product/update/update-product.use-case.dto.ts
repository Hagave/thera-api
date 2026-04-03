export interface IUpdateProductInput {
  id: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export interface IUpdateProductOutput {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  updatedAt: Date;
}
