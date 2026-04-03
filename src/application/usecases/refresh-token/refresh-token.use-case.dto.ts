export interface IRefreshTokenInput {
  refreshToken: string;
}

export interface IRefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}
