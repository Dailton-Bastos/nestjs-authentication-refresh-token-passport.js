import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());

	const PORT = process.env.PORT ?? 3000;
	await app.listen(PORT, () => {
		const logger = new Logger("Bootstrap");
		logger.log(
			`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`,
		);
	});
}
bootstrap();
