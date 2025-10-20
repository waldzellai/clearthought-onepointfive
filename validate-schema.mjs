import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

// Fetch schema from the URL
const schemaUrl = 'https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json';
const schemaResponse = await fetch(schemaUrl);
const schema = await schemaResponse.json();

// Read server.json
const serverJson = JSON.parse(readFileSync('./server.json', 'utf8'));

// Validate
const validate = ajv.compile(schema);
const valid = validate(serverJson);

if (valid) {
  console.log('✓ server.json is valid!');
  process.exit(0);
} else {
  console.error('✗ server.json validation failed:');
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}
