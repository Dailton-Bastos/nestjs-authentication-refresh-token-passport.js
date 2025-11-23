import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { Types } from "mongoose";
import { SchemaTypes } from "mongoose";

@Schema()
export class User {
	@Prop({ type: SchemaTypes.ObjectId, auto: true })
	_id: Types.ObjectId;

	@Prop({ unique: true })
	email: string;

	@Prop({ required: true })
	password: string;

	@Prop()
	refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
