import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import bcrypt from "bcryptjs";
import type { Model } from "mongoose";
import type { CreateUserRequest } from "./dto/create-user.request";
import { User } from "./schema/user.schema";

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}

	async createUser(data: CreateUserRequest): Promise<User> {
		const passwordHash = await bcrypt.hash(data.password, 10);

		const user = await new this.userModel({
			...data,
			password: passwordHash,
		}).save();

		return user;
	}
}
