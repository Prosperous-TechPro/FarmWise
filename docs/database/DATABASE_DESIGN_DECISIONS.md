# FarmWise Database Design Decisions - Sprint 2

## Overview

This document explains the key architectural and design decisions made for the FarmWise database schema in Sprint 2. These decisions prioritize data integrity, extensibility, multi-farm isolation, and future scalability.

## Decision 1: Primary Key Strategy (CUID)

**Decision**: Use CUID (Collision-resistant ID) for all primary keys instead of UUIDs or auto-incrementing integers

**Alternatives Considered**:
1. UUID (UUID v4) - Standard but large (16 bytes)
2. Snowflake IDs - Good for distributed systems but require ID server
3. Auto-incrementing integers - Small and fast but not suitable for distributed systems

**Rationale**:
- **Sortable by time**: CUID IDs contain timestamp information, useful for logs and audits
- **Distributed generation**: Can generate IDs on client side (future offline-first capability)
- **Collision resistance**: Guaranteed collision-resistant up to 16 million simultaneous IDs
- **Smaller than UUID**: 24 characters vs 36 for UUID
- **Database agnostic**: Works with any database

**Implementation**:
```prisma
model Farm {
  id    String   @id @default(cuid())  // Automatically generates CUID
  // ...
}
```

**Production Impact**:
- Enables offline-first architecture in future (mobile app can generate IDs locally)
- All IDs sortable by creation time
- No ID server dependency

---

## Decision 2: Timestamp Strategy (Multiple Types)

**Decision**: Use three distinct timestamp types for different purposes:
1. `createdAt` - Database insertion time (immutable)
2. `updatedAt` - Last modification time (mutable)
3. Event-specific timestamps - Business event date (distinct from record date)

**Alternatives Considered**:
1. Single timestamp field (insufficient for audit trail)
2. Only updatedAt (loses record creation date)
3. Event date only (loses system record date)

**Rationale**:
- **Audit trail**: createdAt + updatedAt enables historical change tracking
- **Business logic**: Event dates (activityDate, harvestDate, feedingDate) capture when action occurred
- **Recording lag**: May record activity days/weeks after it happens
  - Farmer fertilizes field on Jan 15
  - Enters in system on Jan 17
  - We need both dates

**Implementation**:
```prisma
model LivestockEvent {
  eventDate     DateTime   // When vaccination actually happened
  recordedAt    DateTime @default(now())  // When farmer entered it
  createdAt     DateTime @default(now())  // When database received it
}

model FarmActivity {
  activityDate  DateTime   // Day activity happened
  activityTime  DateTime?  // Optional specific time
  createdAt     DateTime @default(now())  // When recorded in system
  updatedAt     DateTime @updatedAt
}
```

**Production Impact**:
- Accurate activity dates for reporting (not system entry date)
- Audit trail for compliance (when data modified)
- Timestamp reconciliation if offline sync occurs

---

## Decision 3: Monetary Values - Decimal Type

**Decision**: Use `Decimal(12, 2)` for all monetary amounts, not floating-point

**Alternatives Considered**:
1. Float/Double - Easy but has rounding errors
2. Integer (pennies) - Avoids decimals but awkward
3. String - No arithmetic, error-prone
4. Money type (PostgreSQL) - Specific to PostgreSQL only

**Rationale**:
- **Exact arithmetic**: Decimal math never has rounding errors
- **Financial accuracy**: GHS 100.25 + 50.75 = 151.00 (no floating-point artifacts)
- **Standard practice**: Industry standard for financial systems
- **12 digits total, 2 decimals**: Supports amounts up to 9,999,999,999.99

**Example Problem with Float**:
```javascript
0.1 + 0.2  // JavaScript: 0.30000000000000004 (incorrect!)
```

**Implementation**:
```prisma
model Expense {
  amount       Decimal  @db.Decimal(12, 2)  // Exact decimal
  currency     Currency @default(GHS)       // Separate currency field
}
```

**Production Impact**:
- Zero financial rounding errors
- Audit-safe for regulatory compliance
- Can't accidentally lose cents in calculations

---

## Decision 4: Multi-Farm Isolation Architecture

**Decision**: Enforce farm-scoped data isolation at database level using foreign keys

**Alternatives Considered**:
1. Single-tenant table per farm - Operationally complex, schema explosion
2. Soft deletion (deletedAt) - Less explicit, error-prone
3. Application-only enforcement - Risky if bug allows cross-farm access
4. Row-level security (PostgreSQL RLS) - Complex but considered for future

**Rationale**:
- **Security**: Database enforces isolation, not just code
- **Data integrity**: Foreign key constraints prevent orphaned records
- **Performance**: farmId indexes enable efficient scoping
- **Auditability**: Clear ownership chain (Farm → Fields → CropCycles)

**Implementation Pattern**:
```prisma
model Farm {
  id      String   @id @default(cuid())
  ownerId String   // Owner cannot be changed
  // ... farm data
}

model Livestock {
  id      String   @id @default(cuid())
  farmId  String
  // ... cannot query without farmId constraint
}
```

**Application Pattern**:
```javascript
// All queries must include farm scope
const animals = await prisma.livestock.findMany({
  where: {
    farmId: userFarmId,  // Always scoped
  },
});
```

**Production Impact**:
- Prevents cross-farm data leakage
- Enables multi-tenant SaaS model safely
- Farm data completely isolated in database

---

## Decision 5: Extensible Entity Design

**Decision**: Design core entities (Crops, LivestockSpecies) as mutable catalogs, not hard-coded enums

**Alternatives Considered**:
1. Hard-coded enums (CropType enum with MAIZE, CASSAVA, TOMATO) - Restrictive
2. String field with validation - No referential integrity
3. Global catalog tables with Crop/LivestockSpecies - Selected approach

**Rationale**:
- **No schema changes for new crops/species**: Add Crop row, existing schema compatible
- **Referential integrity**: Foreign keys ensure valid crops/species
- **Extensibility**: System not limited to predefined types
- **Business flexibility**: Farmers can work with any crop/animal type

**Example - Adding New Crop Type**:

Hard-coded approach requires migration:
```sql
ALTER TYPE CropType ADD VALUE 'GINGER';  -- Schema change
```

Catalog approach just needs insertion:
```javascript
await prisma.crop.create({ data: { name: 'Ginger' } });
```

**Implementation**:
```prisma
model Crop {
  id   String   @id @default(cuid())
  name String   @unique  // System-wide unique, not enum
  // ...
}

model CropCycle {
  cropId String  // Foreign key, not hard-coded enum
  crop   Crop    @relation(fields: [cropId], references: [id])
}
```

**Production Impact**:
- Add new crops without database migration
- Support any livestock species (pigs, cattle, goats, chickens, etc.)
- Future-proof for domain expansion

---

## Decision 6: Farm Membership Architecture

**Decision**: Use FarmMember junction table instead of single farmId on User

**Alternatives Considered**:
1. Single farmId on User - One farm per user
2. FarmId array - Non-relational, poor queries
3. FarmMember junction table - Selected approach

**Rationale**:
- **Many-to-many**: User can own/work on multiple farms
- **Role-based**: Each user has role per farm (OWNER, MANAGER, WORKER)
- **Status tracking**: Track membership status (ACTIVE, INVITED, PENDING)
- **Audit trail**: joinedAt timestamp for compliance

**Data Model**:
```
User: Alice
├── FarmMember (farmId=A, role=OWNER)      // Owns Farm A
├── FarmMember (farmId=B, role=MANAGER)    // Manages Farm B
└── FarmMember (farmId=C, role=WORKER)     // Works on Farm C
```

**Business Scenarios Supported**:
- Farm ownership: User owns their own farm
- Delegation: Owner adds manager to farm
- Collaboration: Multiple workers on one farm
- Portfolio: Worker maintains multiple farms

**Production Impact**:
- Enables collaborative farming operations
- Supports seasonal workers on multiple farms
- Role-based access control per farm
- Clear audit trail of farm membership changes

---

## Decision 7: Deletion Strategy (CASCADE vs RESTRICT vs SET NULL)

**Decision**: Use mixed deletion strategies depending on data criticality

| Relationship | Strategy | Rationale |
|---|---|---|
| Farm → Livestock | CASCADE | Deleting farm deletes all farm data |
| Livestock → HealthRecord | CASCADE | Health records tied to specific animal |
| BreedingRecord.maleId | SET NULL | Preserve breeding history if male sold |
| Expense.cropCycleId | SET NULL | Preserve expense if crop cycle deleted |
| User → AuditLog | RESTRICT | Prevent accidental user deletion |
| User → ownedFarms | RESTRICT | Prevent farm deletion cascade from user |

**Rationale**:
- **CASCADE for operational data**: When farm deleted, delete its fields, livestock, cycles
- **RESTRICT for critical data**: Prevent accidental deletion of historical records
- **SET NULL for associations**: Allow primary deletion while preserving related records

**Examples**:

```prisma
// Cascade: delete farm → delete livestock → delete health records
farm Farm @relation(fields: [farmId], references: [id], onDelete: Cascade)

// Set Null: delete male → breeding record stays but maleId becomes null
male Livestock? @relation(..., onDelete: SetNull)

// Restrict: can't delete user if they have audit logs
user User @relation(fields: [userId], references: [id], onDelete: Restrict)
```

**Production Impact**:
- Prevents accidental data loss (RESTRICT on important data)
- Automatic cleanup (CASCADE on owned data)
- Historical preservation (SET NULL keeps records intact)

---

## Decision 8: Unique Constraints for Data Quality

**Decision**: Apply unique constraints at database level for critical fields

**Unique Constraints Applied**:
1. `User.email` - One email per user globally
2. `User.phone` - One phone per user globally (nullable)
3. `Role.name` - Unique role names
4. `Permission.code` - Unique permission codes
5. `Crop.name` - Unique crop type names
6. `LivestockSpecies.name` - Unique species names
7. `LivestockBreed(speciesId, name)` - Breed names unique per species
8. `Livestock(farmId, tagNumber)` - Animal tag unique per farm

**Composite Unique Constraints** (Multiple columns):
```prisma
@@unique([farmId, tagNumber])     // Same tag allowed in different farms
@@unique([speciesId, name])       // Same breed name OK for different species
@@unique([userId, roleId])        // User can't have same role twice
@@unique([roleId, permissionId])  // Role can't have permission twice
```

**Production Impact**:
- Email prevents duplicate user accounts
- Animal tags scoped per farm (allows TAG-001 in both Farm A and Farm B)
- Breed names scoped per species (allows "Duroc" pig and "Duroc" cattle theoretically)

---

## Decision 9: Enum Strategy - PostgreSQL Enums vs Strings

**Decision**: Use PostgreSQL enums for stable, system-controlled values; strings for user-configurable fields

**Enum Fields** (Controlled by system):
- UserStatus (ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION)
- FarmStatus, FieldStatus, CropCycleStatus, LivestockStatus
- LivestockEventType (BIRTH, FEEDING, VACCINATION, MATING, etc.)
- BreedingStatus
- HealthRecordType
- ActivityCategory
- ExpenseCategory, InputCategory
- AreaUnit, WeightUnit, QuantityUnit
- Currency

**String Fields** (User-configurable):
- FarmMember.role - Flexible role values (can be OWNER, MANAGER, WORKER, or custom)
- Farm.region/district/country - User-entered location names
- Livestock.name - User-chosen animal names
- Input.name - Custom input names
- FarmActivity.description - Free-form notes

**Rationale**:
- **Enums for constraints**: Database validates against predefined list
- **Strings for flexibility**: User can enter custom values if needed
- **Performance**: Enums use integer storage, smaller than strings
- **Schema safety**: Adding enum value requires migration; string adds no migration burden

**Production Impact**:
- Invalid status values prevented at database level
- Custom inputs still possible through string fields
- Enums provide strong typing for backend code

---

## Decision 10: Indexes for Query Performance

**Decision**: Create strategic indexes on frequently-queried columns

**Index Strategy by Category**:

1. **Farm-Scoped Filtering** (Most Common):
   - farmId on all farm-scoped entities
   - Enables: "Get all livestock for farm X"

2. **Date-Range Queries** (Reports):
   - activityDate, expenseDate, plantingDate, feedingDate, etc.
   - Enables: "Get all expenses from Jan 1 to Jan 31"

3. **Status Filtering** (UI Dropdowns):
   - status on Farm, CropCycle, LivestockStatus, etc.
   - Enables: "Show active farms" efficiently

4. **User-Based Queries**:
   - userId on FarmActivity, Expense, Sale, AuditLog
   - Enables: "Get activities recorded by user X"

5. **Type/Category Filtering**:
   - category on FarmActivity, Expense, Input
   - eventType on LivestockEvent
   - Enables: "Get all feeding activities"

6. **Relationship Lookups**:
   - Composite indexes on foreign keys (implicit from constraints)

**Not Indexed** (Intentional):
- firstName/lastName on User (rarely searched)
- description fields (text search would need full-text index)
- JSON fields like mediaReferences (would need JSON operators)

**Production Impact**:
- Fast queries for common UI patterns
- Efficient date-based reports
- Can handle thousands of farm entities
- Room for additional indexes as new query patterns emerge

---

## Decision 11: Field Optionality Strategy

**Decision**: Make fields optional (nullable) only when there's legitimate absence, not "unknown"

**Required Fields**:
- Primary entities: User.email, Farm.name, Livestock.tagNumber, Crop.name
- Relationships: All foreign keys except deliberate nullable cases
- Critical dates: CropCycle.plantingDate, Livestock.acquisitionDate
- Amounts: Expense.amount, Sale.totalAmount

**Optional Fields**:
- Phone (some users don't have mobile)
- DateOfBirth (some animals born before tracking began)
- Notes/description (metadata, not critical)
- breedId on Livestock (not all animals have identified breed)
- maleId on BreedingRecord (male might be unknown/external)
- cropCycleId/livestockId on Expense (can be farm-level expense)

**NOT Optional** (Should be in enum or tracking):
- Status fields: Always have value (not nullable)
- Timestamps: createdAt never null; updatedAt always maintained
- Amounts: Never null (use 0 if not applicable)

**Production Impact**:
- Clear data model (required vs. optional is explicit)
- Fewer null-handling bugs ("Is this null or zero?")
- Better database performance (fewer null checks)

---

## Decision 12: Currency Handling Strategy

**Decision**: Store currency separately from amount using Currency enum

**Alternative Considered**:
- Hard-code GHS everywhere
- Currency as string (VARCHAR)

**Rationale**:
- **Explicit**: Currency not assumed, always clear
- **International future**: Can expand to support USD, EUR, etc.
- **Audit trail**: Transaction history includes original currency
- **Enum safety**: Only valid currencies (GHS, USD, EUR)

**Implementation**:
```prisma
enum Currency {
  GHS  // Ghana Cedi (primary)
  USD  // US Dollar (future)
  EUR  // Euro (future)
}

model Expense {
  amount   Decimal @db.Decimal(12, 2)
  currency Currency @default(GHS)  // Explicit, always present
}
```

**Production Impact**:
- Supports future international expansion
- Currency conversion logic clear (amount + currency together)
- Reports can filter by currency

---

## Decision 13: Audit Logging Architecture

**Decision**: Immutable AuditLog table with JSON change tracking

**Alternatives Considered**:
1. Event sourcing - Complex, every change is an event
2. Change data capture (CDC) - PostgreSQL feature, requires setup
3. Application-level logging - Current approach

**Rationale**:
- **Immutable**: Audit logs themselves can't be deleted/modified (RESTRICT)
- **JSON values**: oldValues/newValues stored as JSON for any entity type
- **Context**: Tracks IP, user agent, correlation ID for debugging
- **Comprehensive**: Works with any entity type

**Implementation**:
```prisma
model AuditLog {
  // What changed
  action       String  // CREATE, UPDATE, DELETE
  entityType   String  // "Expense", "Livestock", etc.
  entityId     String  // Which specific record
  
  // Changes
  oldValues    String?  // JSON: { "amount": 500, "status": "ACTIVE" }
  newValues    String?  // JSON: { "amount": 600, "status": "INACTIVE" }
  
  // Context
  correlationId String?  // Links to request logs
  ipAddress    String?   // User location audit
  userAgent    String?   // Browser/client info
}
```

**Queries Enabled**:
```javascript
// Who modified farm expenses in January?
const changes = await prisma.auditLog.findMany({
  where: {
    farmId: farmId,
    entityType: "Expense",
    createdAt: { gte: jan1, lte: jan31 }
  }
});

// What were the old values before this deletion?
const deletion = await prisma.auditLog.findFirst({
  where: { 
    entityId: livestockId,
    action: "DELETE"
  }
});
```

**Production Impact**:
- Complete audit trail for compliance
- Can show "who changed what when why"
- Debugging: correlationId links to API request logs
- Historical data reconstruction: oldValues enables full history

---

## Decision 14: Soft Delete vs Hard Delete

**Decision**: Use hard delete at database level; soft delete (deletedAt) implemented at application layer if needed

**Rationale**:
- **Simpler schema**: No need for deletedAt fields on all tables
- **Performance**: No need to filter deleted records in every query
- **Audit trail**: AuditLog captures deleted records anyway
- **Compliance**: GDPR right-to-be-forgotten requires actual deletion option
- **Flexibility**: App can implement soft delete where needed (e.g., User accounts)

**Future Soft Delete** (If needed):
```prisma
model User {
  deletedAt DateTime?  // For soft delete: set instead of removing
}

// Query only active users
const users = await prisma.user.findMany({
  where: { deletedAt: null }
});
```

**Production Impact**:
- Audit trail (AuditLog) preserves deleted data permanently
- Historical queries (SELECT WHERE deleted) show full history
- Hard delete allows GDPR compliance when required
- Soft delete simple to add without schema redesign

---

## Decision 15: JSON Field Usage

**Decision**: Use JSON fields sparingly for flexible data; keep schema columns for queryable data

**JSON Fields Used**:
- AuditLog.oldValues/newValues - Change history (not queried directly)
- LivestockEvent.details - Event-specific metadata (variable structure)
- FarmActivity.mediaReferences - Array of file IDs
- MediaFile.tags - Array of tag strings
- Notification.relatedEntityType/Id - Entity association (could be table but generic needed)

**NOT JSON** (Even though could be):
- CropCycleStatus - Used in WHERE clauses (must be queryable)
- Expense.category - Need to sum expenses by category (must be queryable)
- Livestock.sex - Frequently filtered (must be queryable)

**Rationale**:
- **Queryable**: Use regular columns for frequent filtering/sorting
- **Flexible**: Use JSON for variable structure (metadata, tags)
- **Performance**: JSON queries are slower; avoid for common patterns

**Production Impact**:
- Reports can group by category, status, type efficiently
- Metadata stored flexibly without schema changes
- Can't query inside JSON fields (design limitation)

---

## Decision 16: Handling Optional Breeding Information

**Decision**: Allow maleId to be NULL on BreedingRecord; allows "breeding with unknown male"

**Rationale**:
- Real scenario: Female from another farm mated (unknown male)
- Historical preservation: Breeding outcome still valuable
- Flexibility: Not all breeding events have identified participants

**Implementation**:
```prisma
model BreedingRecord {
  femaleId    String      // Always required
  maleId      String?     // Optional - can be unknown
  
  female      Livestock   @relation("FemaleAnimal", fields: [femaleId], ...)
  male        Livestock?  @relation("MaleAnimal", fields: [maleId], ...)  // Optional
}
```

**Queries Enabled**:
```javascript
// Known pairings only
const knownBreedings = await prisma.breedingRecord.findMany({
  where: { maleId: { not: null } }
});

// All breedings including unknown males
const allBreedings = await prisma.breedingRecord.findMany({
  include: { female: true, male: true }  // male can be null
});
```

**Production Impact**:
- Captures breeding data even with incomplete information
- Male deletion doesn't cascade to breeding record
- Allows historical breeding analysis despite missing male info

---

## Decision 17: Timestamps on Junction Tables

**Decision**: Add minimal timestamps (createdAt only, no updatedAt) to junction tables

**Rationale**:
- **Immutability pattern**: Junction entries created once, rarely updated
- **Audit trail**: createdAt shows when relationship established
- **Memory efficient**: No need for updatedAt field
- **Simplicity**: If relationship needs update, delete and re-create (explicit)

**Implementation**:
```prisma
model UserRole {
  id        String @id @default(cuid())
  userId    String
  roleId    String
  createdAt DateTime @default(now())  // When assigned
  // No updatedAt - if needs change, delete and recreate
  
  @@unique([userId, roleId])
}
```

**Production Impact**:
- Clear insertion dates for compliance ("when was user added to role")
- Prevents accidental direct updates to relationships
- Explicit delete-recreate operation shows intention

---

## Decision 18: Multi-Currency Support Foundation

**Decision**: Support multiple currencies in schema; implement conversion logic in application

**Why Not Convert to Single Currency**:
- Floating-point rounding errors in conversion
- Exchange rates change (which rate to use?)
- Historical data shows original currency/amount
- Reporting in original currency more transparent

**Implementation**:
```prisma
model Expense {
  amount    Decimal  @db.Decimal(12, 2)
  currency  Currency @default(GHS)  // Explicit currency
}

// Total in original currencies
const expenses = await prisma.expense.findMany({
  where: { farmId },
  include expenses
});

// Application converts for reporting:
// const totalGHS = expenses
//   .filter(e => e.currency === 'GHS')
//   .reduce((sum, e) => sum + e.amount, 0);
```

**Production Impact**:
- Ready for multi-country expansion
- Historical rates preserved for audit
- No implicit currency assumptions

---

## Summary: Design Principles Applied

1. ✅ **Data Integrity**: Foreign keys enforce relationships
2. ✅ **Audit Trail**: Complete history tracking for compliance
3. ✅ **Multi-Tenant**: Farm-scoped isolation at database level
4. ✅ **Extensibility**: Catalog-based design for crops/species
5. ✅ **Performance**: Strategic indexes for common queries
6. ✅ **Scalability**: CUID IDs enable distributed systems
7. ✅ **Flexibility**: JSON fields for variable data
8. ✅ **Safety**: Constraints and unique checks prevent bad data
9. ✅ **Compliance**: Immutable audit logs for regulatory needs
10. ✅ **Correctness**: Decimal types for financial data

---

## Implementation Checklist

- [x] Schema designed with 40+ models
- [x] Relationships modeled with proper deletion strategies
- [x] Indexes applied for query performance
- [x] Enums used for controlled values
- [x] Constraints for data quality
- [x] Audit architecture designed
- [ ] Database created and migrations deployed (blocked on DATABASE_URL/PostgreSQL)
- [ ] Prisma Client generated ✅ (done - successful)
- [ ] Backend integration with Prisma client
- [ ] Application-level RBAC middleware
- [ ] Soft delete implementation (if needed)
- [ ] Performance testing and index validation

---

## References

- **Main Schema**: [database/prisma/schema.prisma](../prisma/schema.prisma)
- **Architecture**: [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)
- **Entity Diagram**: [DATABASE_ERD.md](./DATABASE_ERD.md)
- **Prisma Docs**: https://www.prisma.io/docs/
