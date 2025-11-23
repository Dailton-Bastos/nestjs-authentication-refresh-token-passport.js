/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "auth/auth.service";
import { TokenPayload } from "auth/token-payload.interface";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	"jwt-refresh",
) {
	constructor(
		configService: ConfigService,
		private readonly authService: AuthService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request?.cookies?.Refresh;
				},
			]),
			secretOrKey: configService.getOrThrow<string>("JWT_REFRESH_TOKEN_SECRET"),
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: TokenPayload) {
		return this.authService.verifyUserRefreshToken(
			request.cookies?.Refresh,
			payload.userId,
		);
	}
}
