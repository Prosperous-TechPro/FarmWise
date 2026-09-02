# FarmWise Database

PostgreSQL database configuration with Prisma ORM.

## Setup

### Prerequisites
- PostgreSQL 12+ installed and running
- Node.js 16+

### Installation

```bash
cd database
npm install
```

### Configuration

1. Update the `.env` file in the root directory with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/farmwise_db"
```

2. Generate Prisma Client:

```bash
npm run generate
```

## Migrations

### Create Initial Migration

```bash
npm run migrate
```

This will:
- Create the migration file
- Apply the migration to your database
- Generate Prisma Client

### Deploy Migration

```bash
npm run migrate:deploy
```

Use this in CI/CD pipelines.

### Reset Database (Development Only)

```bash
npm run migrate:reset
```

⚠️ **Warning:** This will delete all data!

## Prisma Studio

View and edit your data with Prisma Studio:

```bash
npm run studio
```

Opens on `http://localhost:5555`

## Schema Structure

The schema is organized by domain:

- **Authentication** - Users, roles, permissions (Sprint 1)
- **Organization** - Farms, fields, farm members (Sprint 2)
- **Livestock** - Species, breeds, individual animals (Sprint 3)
- **Crops** - Crop types, cycles, plantings (Sprint 4)
- **Finance** - Expenses, revenue, profitability (Sprint 5)
- **Production** - Harvests, yields, production records (Sprint 4)
- **Sync** - Offline synchronization tracking (Sprint 6)

## Database Principles

### Data Integrity
- All tables have primary keys
- Foreign keys enforce referential integrity
- Proper cascading behavior for deletions

### Audit Trail
- Created/Updated timestamps on important records
- Soft deletes where appropriate

### Performance
- Proper indexing on frequently queried fields
- Efficient relationship loading

### Security
- Multi-tenancy support (farm isolation)
- User authorization checks required

## Accessing the Database

### From Backend

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example query
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

### Direct PostgreSQL

```bash
psql postgresql://username:password@localhost:5432/farmwise_db
```

## Development Workflow

1. **Modify schema** - Edit `prisma/schema.prisma`
2. **Create migration** - Run `npm run migrate`
3. **Review changes** - Check migration file in `prisma/migrations/`
4. **Generate client** - Prisma automatically generates updated client
5. **Use in code** - Import `@prisma/client` in your application

## Documentation

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Schema Documentation](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## Current Status

✓ Prisma configured
✓ PostgreSQL connection configured
⏳ Schema implementation begins in Sprint 1
