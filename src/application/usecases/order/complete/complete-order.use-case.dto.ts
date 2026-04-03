export interface ICompleteOrderInput {
  id: string;
}

export interface ICompleteOrderOutput {
  id: string;
  status: string;
  updatedAt: Date;
}
