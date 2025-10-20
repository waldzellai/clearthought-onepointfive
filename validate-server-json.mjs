#!/usr/bin/env node
import { readFileSync } from 'fs';

try {
  // Read server.json
  const serverJson = JSON.parse(readFileSync('./server.json', 'utf8'));

  console.log('Validating server.json structure...\n');

  // Required fields
  const requiredFields = ['$schema', 'name', 'title', 'description', 'version'];
  const missingFields = requiredFields.filter(field => !serverJson[field]);

  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
    process.exit(1);
  }

  // Validate name format (should be io.github.* or domain format)
  if (!serverJson.name.match(/^(io\.github\.[a-z0-9-]+\/[a-z0-9-]+|[a-z0-9.-]+\.[a-z]+\/[a-z0-9-]+)$/i)) {
    console.error('❌ Invalid name format:', serverJson.name);
    console.error('   Expected: io.github.username/server-name or com.company/server-name');
    process.exit(1);
  }

  // Validate schema URL
  if (!serverJson.$schema.startsWith('https://static.modelcontextprotocol.io/schemas/')) {
    console.error('❌ Invalid schema URL');
    process.exit(1);
  }

  // Validate packages or remotes
  if (!serverJson.packages && !serverJson.remotes) {
    console.error('❌ Must have either packages or remotes field');
    process.exit(1);
  }

  // Validate packages structure if present
  if (serverJson.packages) {
    if (!Array.isArray(serverJson.packages) || serverJson.packages.length === 0) {
      console.error('❌ packages must be a non-empty array');
      process.exit(1);
    }

    for (const pkg of serverJson.packages) {
      if (!pkg.registryType || !pkg.identifier || !pkg.transport) {
        console.error('❌ Package missing required fields:', pkg);
        process.exit(1);
      }

      if (!pkg.transport.type) {
        console.error('❌ Package transport missing type:', pkg);
        process.exit(1);
      }
    }
  }

  // Success
  console.log('✅ Basic structure validation passed');
  console.log('\nServer details:');
  console.log('  Name:', serverJson.name);
  console.log('  Title:', serverJson.title);
  console.log('  Version:', serverJson.version);
  console.log('  Description:', serverJson.description);

  if (serverJson.packages) {
    console.log('\nPackages:');
    serverJson.packages.forEach((pkg, i) => {
      console.log(`  ${i + 1}. ${pkg.registryType}: ${pkg.identifier}`);
      console.log(`     Transport: ${pkg.transport.type}`);
    });
  }

  console.log('\n✅ server.json appears valid!');
  console.log('\nNote: Full schema validation will occur when publishing to the MCP registry.');

  process.exit(0);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
