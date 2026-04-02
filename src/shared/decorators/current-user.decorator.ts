import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ICurrentUser {
  id: string;
  email: string;
  name: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
