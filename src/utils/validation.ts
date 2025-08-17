import Ajv from "ajv";
import type { JSONSchema7 } from "json-schema";

const ajv = new (Ajv as any)({ allErrors: true });

export function validateWithErrors(data: unknown, schema: JSONSchema7): void {
	const validate = ajv.compile(schema);
	const valid = validate(data);

	if (!valid) {
		const errors = validate.errors || [];
		const errorMessages = errors.map((err: any) => {
			const path = err.instancePath || "";
			const message = err.message || "Validation error";
			return path ? `${path}: ${message}` : message;
		});

		throw new Error(`Validation failed: ${errorMessages.join(", ")}`);
	}
}
