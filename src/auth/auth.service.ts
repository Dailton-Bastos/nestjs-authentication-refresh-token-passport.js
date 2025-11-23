/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import type { Response } from "express";
import { User } from "users/schema/user.schema";
import { UsersService } from "users/users.service";
import type { TokenPayload } from "./token-payload.interface";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	async login(user: User, response: Response) {
		const expiresAccessToken = new Date();

		expiresAccessToken.setMilliseconds(
			expiresAccessToken.getTime() +
				parseInt(
					this.configService.getOrThrow<string>(
						"JWT_ACCESS_TOKEN_EXPIRATION_MS",
					),
					10,
				),
		);

		const tokenPayload: TokenPayload = {
			userId: user._id,
		};

		const accessToken = this.jwtService.sign(tokenPayload, {
			secret: this.configService.getOrThrow<string>("JWT_ACCESS_TOKEN_SECRET"),
			expiresIn: `${this.configService.getOrThrow<number>(
				"JWT_ACCESS_TOKEN_EXPIRATION_MS",
			)}ms`,
		});

		response.cookie("Authentication", accessToken, {
			httpOnly: true,
			secure:
				this.configService.getOrThrow<string>("NODE_ENV") === "production",
			expires: expiresAccessToken,
		});

		return user;
	}

	async verifyUser(email: string, password: string) {
		try {
			const user = await this.usersService.getUser({ email });

			const authenticated = await compare(password, user.password);

			if (!authenticated) {
				throw new UnauthorizedException("Invalid credentials");
			}

			return user;
		} catch {
			throw new UnauthorizedException("Invalid credentials");
		}
	}
}
