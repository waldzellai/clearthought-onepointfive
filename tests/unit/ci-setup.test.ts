import { describe, expect, it } from "vitest";

describe("CI/CD Infrastructure Setup", () => {
	it("should have basic test infrastructure working", () => {
		expect(true).toBe(true);
	});

	it("should be able to run assertions", () => {
		const sum = (a: number, b: number) => a + b;
		expect(sum(2, 2)).toBe(4);
	});

	it("should support async tests", async () => {
		const asyncFunc = async () => {
			return Promise.resolve("success");
		};
		const result = await asyncFunc();
		expect(result).toBe("success");
	});
});
