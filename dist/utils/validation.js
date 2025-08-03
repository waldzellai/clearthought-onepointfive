import Ajv from "ajv";
const ajv = new Ajv({ allErrors: true });
export function validateWithErrors(data, schema) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        const errors = validate.errors || [];
        const errorMessages = errors.map((err) => {
            const path = err.instancePath || '';
            const message = err.message || 'Validation error';
            return path ? `${path}: ${message}` : message;
        });
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
}
