const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const databaseUrl = process.env.DATABASE_URL || '';

if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  console.log('Detected PostgreSQL database URL. Swapping Prisma provider to postgresql...');
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
} else {
  console.log('Detected SQLite database URL (or no PostgreSQL URL). Ensuring Prisma provider is sqlite...');
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Prisma schema updated successfully.');
