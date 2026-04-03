export interface ILogoutInput {
  refreshToken: string;
}

export interface ILogoutOutput {
  success: boolean;
  message: string;
}
