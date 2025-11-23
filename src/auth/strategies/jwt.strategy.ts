/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { TokenPayload } from "auth/token-payload.interface";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
	constructor(
		configService: ConfigService,
		private readonly usersService: UsersService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return (
						request?.cookies?.Authentication || request?.headers?.authorization
					);
				},
			]),
			secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_TOKEN_SECRET"),
		});
	}

	async validate(payload: TokenPayload) {
		return this.usersService.getUser({ _id: payload.userId });
	}
}
