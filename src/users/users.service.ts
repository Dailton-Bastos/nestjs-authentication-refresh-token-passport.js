import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import bcrypt from "bcryptjs";
import type { Model, QueryFilter, UpdateQuery } from "mongoose";
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

	async getUser(query: QueryFilter<User>) {
		const user = await this.userModel.findOne(query).exec();

		if (!user) {
			throw new NotFoundException("User not found");
		}

		return user;
	}

	async getUsers() {
		return this.userModel.find({});
	}

	async updateUser(query: QueryFilter<User>, data: UpdateQuery<User>) {
		return this.userModel.findOneAndUpdate(query, data);
	}
}
