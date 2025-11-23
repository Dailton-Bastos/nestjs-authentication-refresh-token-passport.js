/** biome-ignore-all lint/style/useImportType: <Nest can't resolve dependencies> */
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "auth/guards/jwt-auth.guard";
import { CreateUserRequest } from "./dto/create-user.request";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async createUser(@Body() request: CreateUserRequest) {
		return this.usersService.createUser(request);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getUsers() {
		return this.usersService.getUsers();
	}
}
