/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Controller, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { User } from "users/schema/user.schema";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { JwtRefreshAuthGuard } from "./guards/jwt-refres-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@UseGuards(LocalAuthGuard)
	async login(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) response: Response,
	) {
		return this.authService.login(user, response);
	}

	@Post("refresh")
	@UseGuards(JwtRefreshAuthGuard)
	async refreshToken(
		@CurrentUser() user: User,
		@Res({ passthrough: true }) response: Response,
	) {
		return this.authService.login(user, response);
	}
}
