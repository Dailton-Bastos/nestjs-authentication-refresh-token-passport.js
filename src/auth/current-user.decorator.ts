import type { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import type { Request } from "express";
import type { User } from "users/schema/user.schema";

export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
		return request.user;
	},
);
