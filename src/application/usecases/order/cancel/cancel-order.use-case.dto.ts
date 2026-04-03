export interface ICancelOrderInput {
  id: string;
}

export interface ICancelOrderOutput {
  id: string;
  status: string;
  updatedAt: Date;
}
