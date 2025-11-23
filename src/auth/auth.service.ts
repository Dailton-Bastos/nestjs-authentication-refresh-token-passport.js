/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import type { Response } from "express";
import type { Types } from "mongoose";
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

		const expiresRefreshToken = new Date();

		expiresRefreshToken.setMilliseconds(
			expiresRefreshToken.getTime() +
				parseInt(
					this.configService.getOrThrow<string>(
						"JWT_REFRESH_TOKEN_EXPIRATION_MS",
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

		const refreshToken = this.jwtService.sign(tokenPayload, {
			secret: this.configService.getOrThrow<string>("JWT_REFRESH_TOKEN_SECRET"),
			expiresIn: `${this.configService.getOrThrow<number>(
				"JWT_REFRESH_TOKEN_EXPIRATION_MS",
			)}ms`,
		});

		await this.usersService.updateUser(
			{ _id: user._id },
			{ $set: { refreshToken: await hash(refreshToken, 10) } },
		);

		response.cookie("Refresh", refreshToken, {
			httpOnly: true,
			secure:
				this.configService.getOrThrow<string>("NODE_ENV") === "production",
			expires: expiresRefreshToken,
		});
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

	async verifyUserRefreshToken(refreshToken: string, userId: Types.ObjectId) {
		try {
			const user = await this.usersService.getUser({ _id: userId });

			const authenticated = await compare(
				refreshToken,
				user.refreshToken ?? "",
			);

			if (!authenticated) {
				throw new UnauthorizedException("Invalid credentials");
			}

			return user;
		} catch {
			throw new UnauthorizedException("Refresh token is not valid");
		}
	}
}
