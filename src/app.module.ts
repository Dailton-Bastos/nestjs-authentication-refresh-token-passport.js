import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		MongooseModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				uri: `mongodb://${configService.getOrThrow<string>(
					"MONGO_HOST",
				)}:${configService.getOrThrow<string>("MONGO_PORT")}`,
				user: configService.getOrThrow<string>("MONGO_INITDB_ROOT_USERNAME"),
				pass: configService.getOrThrow<string>("MONGO_INITDB_ROOT_PASSWORD"),
				dbName: configService.getOrThrow<string>("MONGO_DB_NAME"),
			}),
			inject: [ConfigService],
		}),
		UsersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
