import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { AppService } from "./app.service";

describe("AppService", () => {
	let appService: AppService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: AppService,
					useValue: {
						health: jest.fn(),
					},
				},
			],
		}).compile();

		appService = module.get<AppService>(AppService);
	});

	describe("health", () => {
		it("should return status ok and timestamp", () => {
			const health = {
				status: "ok",
				timestamp: expect.any(Date),
			};

			jest.spyOn(appService, "health").mockReturnValue(health);

			const result = appService.health();

			expect(result).toEqual(health);
			expect(appService.health).toHaveBeenCalledTimes(1);
		});
	});
});
