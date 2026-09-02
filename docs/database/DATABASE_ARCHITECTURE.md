# FarmWise Database Architecture - Sprint 2

## Overview

This document describes the complete database schema designed for FarmWise Sprint 2. The schema implements a multi-farm, normalized relational data model supporting users, farms, livestock management, crop management, financial tracking, and audit logging.

## Design Principles

1. **Multi-Farm Architecture**: Users can own multiple farms and work on multiple farms. Farms are the primary isolation boundary.
2. **Extensibility**: Core entities (Crops, LivestockSpecies) are not hard-coded; new types can be added at runtime.
3. **Data Integrity**: Foreign key relationships with intentional deletion strategies (CASCADE, RESTRICT, SET NULL).
4. **Audit Trail**: All important operations are tracked in AuditLog for compliance and data integrity verification.
5. **Type Safety**: PostgreSQL enums for stable, controlled values (status fields, categories, event types).
6. **Performance**: Strategic indexes on frequently-queried columns (farm lookups, date ranges, user relationships).

## Entity Categories

### 1. Authentication & Authorization

#### User
- Central user entity with account status and verification flags
- Supports email/phone verification (for SMS/email notifications)
- Two-factor authentication flag (implementation deferred to Sprint 3)
- Status: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- **Fields**: id, email, phone, firstName, lastName, passwordHash, status, emailVerified, phoneVerified, twoFactorEnabled, timestamps, lastLoginAt

#### Role
- User roles in the system (SUPERADMIN, ADMIN, FARM_OWNER, WORKER, etc.)
- Defined at system level; assigned to users via UserRole junction table
- **Fields**: id, name, description, timestamps

#### Permission
- Granular permissions (e.g., farm:view, farm:edit, livestock:manage)
- Organized by category for easier management
- **Fields**: id, code, name, description, category, timestamps

#### UserRole (Junction Table)
- Links users to roles
- Many-to-many: One user can have multiple roles, one role can be assigned to many users
- **Fields**: id, userId, roleId, timestamps

#### RolePermission (Junction Table)
- Links roles to permissions
- Many-to-many: One role has multiple permissions, one permission can be in many roles
- **Fields**: id, roleId, permissionId, timestamps

### 2. Farm Organization

#### Farm
- Represents a farm operation
- Owned by a user; other users can be members
- Has location (region, district, country, GPS coordinates)
- Status: ACTIVE, INACTIVE, ARCHIVED
- **Fields**: id, ownerId, name, description, region, district, country, latitude, longitude, status, timestamps

#### FarmMember (Junction Table)
- Users belonging to a farm with specific roles
- Enables multi-user farm management (owner, manager, worker, etc.)
- Unique constraint: one user can only join a farm once
- **Fields**: id, userId, farmId, role, status, joinedAt, timestamps

#### Field
- Physical fields within a farm
- Has area measurement and location
- Status: ACTIVE, INACTIVE, ARCHIVED
- **Fields**: id, farmId, name, description, area, areaUnit, latitude, longitude, status, timestamps

### 3. Crop Management

#### Crop
- Crop types (Maize, Cassava, Tomato, etc.)
- System-wide catalog; farms select from available crops
- Optional growing information (average days to maturity)
- **Fields**: id, name, description, averageGrowingDays, timestamps

#### CropCycle
- A planting cycle for a specific crop in a specific field
- Tracks status from planning through completion
- Stores yield expectations and actual yields
- Status: PLANNING, PREPARED, PLANTED, GROWING, HARVESTING, COMPLETED, ABANDONED
- **Fields**: id, farmId, fieldId, cropId, status, plantedArea, areaUnit, plantingDate, expectedHarvestDate, actualHarvestDate, expectedYield, actualYield, yieldUnit, notes, timestamps

**Relationships**:
- CropCycle → Farm (many crop cycles per farm)
- CropCycle → Field (many cycles per field over time)
- CropCycle → Crop (fixed crop type per cycle)
- CropCycle ← Expense (associated expenses)
- CropCycle ← Sale (sales from this crop)
- CropCycle ← ProductionRecord (production tracking)
- CropCycle ← Harvest (final harvest records)

### 4. Livestock Management

#### LivestockSpecies
- Animal species (Pig, Cattle, Goat, Chicken, etc.)
- System-wide catalog; extensible design
- **Fields**: id, name, description, timestamps

#### LivestockBreed
- Animal breeds within a species (e.g., Duroc, Landrace for pigs)
- Optional per livestock (some animals may not have breed specified)
- Unique constraint: species + breed name combination
- **Fields**: id, speciesId, name, description, timestamps

#### Livestock
- Individual animals in a farm
- Tracked with unique tag number per farm (farm-scoped uniqueness)
- Status: ACTIVE, SOLD, DECEASED, TRANSFERRED
- Stores biological information (birth date, weight, sex)
- **Fields**: id, farmId, speciesId, breedId, tagNumber, name, sex, status, dateOfBirth, acquisitionDate, acquisitionSource, currentWeight, weightUnit, timestamps

**Key Design**:
- FarmId + TagNumber is unique - animals identified by local tag number within farm
- breedId is optional - not all animals have detailed breed info
- sex stored as single character (M/F) for efficiency

#### LivestockEvent
- Historical events for animals (birth, feeding, vaccination, mating, mortality, etc.)
- Non-destructive audit trail
- eventDate distinct from recordedAt (event happens on one date, recorded later)
- **Fields**: id, livestockId, eventType, eventDate, description, details (JSON), recordedAt, createdAt

#### BreedingRecord
- Mating and breeding outcomes (especially important for pigs)
- Tracks female animal, optional male (if unknown)
- Status: PLANNED, MATING_COMPLETED, PREGNANCY_CONFIRMED, FARROWING_EXPECTED, FARROWING_COMPLETED, FAILED, CANCELLED
- Stores outcome (number of piglets, counts by sex, stillborns)
- **Fields**: id, femaleId, maleId, status, matingDate, expectedFarrowingDate, actualFarrowingDate, numberOfPiglets, maleCount, femaleCount, stillbornCount, notes, timestamps

**Relationships**:
- Female → Livestock (via femaleId, Cascade on delete)
- Male → Livestock (via maleId, SetNull on delete - historical record preserved)

#### HealthRecord
- Medical observations, vaccinations, treatments, diagnoses
- eventDate distinct from createdAt (observation date vs. record date)
- recordType: OBSERVATION, VACCINATION, MEDICATION, TREATMENT, DIAGNOSIS, SYMPTOM
- Stores veterinarian, medication, dosage, follow-up dates
- **Fields**: id, livestockId, recordType, title, description, veterinarian, medication, dosage, followUpDate, eventDate, timestamps

#### FeedingRecord
- Livestock feeding history and costs
- Tracks feed type, quantity, date/time, and cost
- Used for feed management and financial tracking
- **Fields**: id, livestockId, feedType, quantity, quantityUnit, feedingDate, feedingTime, cost, currency, recordedBy, notes, timestamps

### 5. Farm Operations

#### FarmActivity
- General farm activities and operations
- Can be associated with specific fields or livestock
- Tracks category, quantity, date, and cost
- mediaReferences stores JSON array of media file IDs
- **Fields**: id, farmId, userId, category, description, fieldId, livestockId, activityDate, activityTime, quantity, quantityUnit, cost, currency, notes, mediaReferences, timestamps

#### Input
- Agricultural input definitions and inventory
- Seeds, fertilizers, pesticides, feeds, medications, equipment
- Stores supplier and unit cost information
- **Fields**: id, farmId, name, category, description, supplier, unitOfMeasure, unitCost, currency, timestamps

### 6. Financial Tracking

#### Expense
- Farm expenses and costs
- Associated with specific crop cycles or livestock (optional)
- Categories: FEED, SEED, FERTILIZER, PESTICIDE, HERBICIDE, MEDICATION, LABOR, EQUIPMENT, etc.
- Tracks receipt reference for audit trail
- **Fields**: id, farmId, recordedBy, category, description, amount, currency, cropCycleId, livestockId, expenseDate, receiptReference, timestamps

#### Sale
- Sales records and revenue
- Associated with specific crop cycles or livestock (optional)
- Tracks buyer, product, quantity, unit price, total amount
- **Fields**: id, farmId, recordedBy, product, quantity, quantityUnit, unitPrice, totalAmount, currency, buyer, cropCycleId, livestockId, saleDate, saleTime, reference, notes, timestamps

### 7. Production & Harvest

#### ProductionRecord
- Production/yield tracking
- Can be associated with crops or livestock
- Stores quality grade and quality assessment
- **Fields**: id, farmId, recordedBy, product, quantity, quantityUnit, grade, quality, cropCycleId, livestockId, productionDate, notes, timestamps

#### Harvest
- Specific harvest records for crops
- Associated with CropCycle and Field (via CropCycle)
- Tracks quantity, quality grade, damage assessment
- Distinct from CropCycle.actualYield: Harvest captures detail of specific harvest event
- **Fields**: id, farmId, cropCycleId, recordedBy, quantity, quantityUnit, grade, damagePercentage, harvestDate, notes, timestamps

### 8. Audit & Compliance

#### AuditLog
- Audit trail for important operations
- Captures action (CREATE, UPDATE, DELETE), entity type, entity ID
- Stores oldValues and newValues as JSON for change tracking
- Includes request context (correlation ID, IP, user agent) for debugging
- Create-only; never updated
- **Fields**: id, farmId, userId, action, entityType, entityId, oldValues, newValues, correlationId, ipAddress, userAgent, createdAt

### 9. Notifications & Alerts (Foundation)

#### Notification
- Foundation for future notification system
- Stores notification type, title, message
- Tracks read status with timestamp
- Can associate with specific entity (e.g., animal alert, crop alert)
- **Fields**: id, farmId, type, title, message, read, readAt, relatedEntityType, relatedEntityId, timestamps

### 10. Media & Attachments (Foundation)

#### MediaFile
- References to images and media files
- Stores file metadata (name, MIME type, size)
- Storage location info (path, storage type - local/S3/etc)
- Can associate with any entity via relatedEntityType/relatedEntityId
- Stores tags as JSON for searchability
- **Fields**: id, fileName, mimeType, size, storagePath, storageType, relatedEntityType, relatedEntityId, description, tags, timestamps

## Data Types & Strategies

### Primary Keys
- **Strategy**: CUID (Collision-resistant ID)
- **Rationale**: Better for distributed systems and offline-first applications; can generate IDs on client side
- **Implementation**: `@id @default(cuid())`

### Timestamps
- **createdAt**: Database insertion time (immutable)
- **updatedAt**: Last modification time (mutable)
- **Strategy**: UTC timezone, set by database server
- **Special Cases**:
  - LivestockEvent: Also stores `eventDate` (distinct from `recordedAt`)
  - HealthRecord: Also stores `eventDate` (observation date vs. record date)
  - FarmActivity: Also stores `activityDate` and optional `activityTime`
  - All date/time fields: Use `DateTime` type, PostgreSQL TIMESTAMP WITH TIME ZONE

### Monetary Values
- **Strategy**: `Decimal(12, 2)` type
- **Rationale**: Exact decimal arithmetic; prevents floating-point errors
- **Fields**: amount, unitPrice, totalAmount, unitCost, cost
- **Currency**: Tracked separately in `currency` enum field

### Area Units
- **Enum**: ACRE, HECTARE, SQUARE_METER, SQUARE_KILOMETER
- **Storage**: Quantity in `Decimal(10, 2)` + Unit in enum
- **Example**: 5.5 hectares stored as area=5.5, areaUnit=HECTARE

### Weight Units
- **Enum**: KILOGRAM, GRAM, POUND, OUNCE
- **Storage**: Weight in `Decimal(8, 2)` + Unit in enum
- **Default**: KILOGRAM

### Quantity Units
- **Enum**: KILOGRAM, GRAM, LITER, MILLILITER, BAG, PIECE, BUNCH, BASKET, OTHER
- **Storage**: Quantity in `Decimal(10, 2)` + Unit in enum
- **Used for**: Seeds, fertilizer, feed, harvested products

### Status Enums
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- **FarmStatus**: ACTIVE, INACTIVE, ARCHIVED
- **FieldStatus**: ACTIVE, INACTIVE, ARCHIVED
- **CropCycleStatus**: PLANNING, PREPARED, PLANTED, GROWING, HARVESTING, COMPLETED, ABANDONED
- **LivestockStatus**: ACTIVE, SOLD, DECEASED, TRANSFERRED
- **BreedingStatus**: PLANNED, MATING_COMPLETED, PREGNANCY_CONFIRMED, FARROWING_EXPECTED, FARROWING_COMPLETED, FAILED, CANCELLED
- **HealthRecordType**: OBSERVATION, VACCINATION, MEDICATION, TREATMENT, DIAGNOSIS, SYMPTOM

### Category Enums
- **ActivityCategory**: PLANTING, WEEDING, FERTILIZING, SPRAYING, WATERING, HARVESTING, FEEDING, VACCINATION, TREATMENT, MAINTENANCE, INSPECTION, OTHER
- **ExpenseCategory**: FEED, SEED, FERTILIZER, PESTICIDE, HERBICIDE, MEDICATION, LABOR, EQUIPMENT, MAINTENANCE, UTILITIES, TRANSPORTATION, STORAGE, OTHER
- **InputCategory**: SEED, FERTILIZER, PESTICIDE, HERBICIDE, FEED, MEDICATION, EQUIPMENT, OTHER

### Currency
- **Enum**: GHS (Ghana Cedi), USD, EUR
- **Default**: GHS (primary currency for Ghana-based farm operations)

## Constraints & Uniqueness

### Unique Constraints
1. **User.email**: Global uniqueness - one email per user
2. **User.phone**: Global uniqueness - one phone per user (nullable)
3. **Role.name**: System role names are unique
4. **Permission.code**: Permission codes are unique
5. **UserRole**: (userId, roleId) composite unique - user can't have same role twice
6. **RolePermission**: (roleId, permissionId) composite unique - role can't have permission twice
7. **LivestockSpecies.name**: Species names are unique
8. **LivestockBreed**: (speciesId, name) composite unique - breed name unique per species
9. **Livestock**: (farmId, tagNumber) composite unique - tag numbers unique per farm
10. **FarmMember**: (userId, farmId) composite unique - user can only join farm once
11. **Crop.name**: Crop names are unique in system

### Foreign Key Deletion Strategies

**CASCADE** (delete related records automatically):
- User → UserRole: When user deleted, remove their roles
- User → FarmMember: When user deleted, remove farm memberships
- User → Farm (ownedFarms): When user deleted, cascade to delete owned farms (problematic - might use RESTRICT instead)
- Role → UserRole: When role deleted, remove assignments
- Role → RolePermission: When role deleted, remove permissions
- Permission → RolePermission: When permission deleted, remove from roles
- Farm → (all farm-scoped entities): When farm deleted, delete all its data
- LivestockSpecies → Livestock: When species deleted, delete all animals (might use RESTRICT)
- LivestockSpecies → LivestockBreed: When species deleted, delete breeds
- LivestockBreed → Livestock: When breed deleted, orphan the breed references (breedId nullable)
- CropCycle → Expense/Sale/ProductionRecord/Harvest: When cycle deleted, remove associated records

**RESTRICT** (prevent deletion if references exist):
- User (as ownedFarms): Prevents accidental deletion of users with farms
- LivestockSpecies: Prevents accidental deletion of species with livestock
- Crop: Prevents accidental deletion of crops with active cycles
- CropCycle (referenced by Expense/Sale): Historical data preservation
- Livestock (referenced by Expense/Sale/BreedingRecord): Historical data preservation
- User (referenced by AuditLog/Expense/Sale/etc): Prevents user deletion if they have records

**SET NULL** (allow deletion, orphan references):
- LivestockEvent.details: If livestock deleted, events become orphaned (alternative: CASCADE)
- BreedingRecord.maleId: If male deleted, record preserved but reference nulled (preserve breeding history)
- FarmActivity.fieldId/livestockId: If field/animal deleted, activity preserved but references nulled
- Expense.cropCycleId/livestockId: If deleted, expense preserved but associations nulled
- Sale.cropCycleId/livestockId: If deleted, sale preserved but associations nulled

## Indexes for Performance

### All Models (Standard Indexes)
- Primary key index (implicit)
- Timestamps for temporal queries

### Specific Indexes

**User**:
- email (unique constraint - implicit)
- phone (unique constraint - implicit)
- status (frequent filtering)

**Farm**:
- ownerId (find farms by owner)
- status (filter active farms)

**Field**:
- farmId (all fields for a farm)
- status (active fields)

**FarmMember**:
- userId (find user's farms)
- farmId (find farm's members)

**CropCycle**:
- farmId (all cycles for farm)
- fieldId (cycles in a field)
- cropId (cycles of a crop)
- status (find active/planning cycles)
- plantingDate (date-range queries)

**Livestock**:
- farmId (animals in farm)
- speciesId (animals of species)
- status (active animals)

**LivestockEvent**:
- livestockId (history of an animal)
- eventType (filter by event type)
- eventDate (date-range queries)

**BreedingRecord**:
- femaleId (breeding history of female)
- maleId (breeding history of male)
- status (find active breedings)
- matingDate (date-range queries)

**HealthRecord**:
- livestockId (health history)
- recordType (filter by type)
- eventDate (date-range queries)

**FeedingRecord**:
- livestockId (feeding history)
- feedingDate (date-range queries)

**FarmActivity**:
- farmId (activities for farm)
- userId (activities by user)
- category (filter by activity type)
- activityDate (date-range queries)

**Input**:
- farmId (inputs for farm)
- category (find inputs by type)

**Expense**:
- farmId (expenses for farm)
- expenseDate (date-range queries)
- category (filter by expense type)

**Sale**:
- farmId (sales for farm)
- saleDate (date-range queries)
- cropCycleId (sales from crop)
- livestockId (sales from animal)

**ProductionRecord**:
- farmId (production for farm)
- productionDate (date-range queries)

**Harvest**:
- farmId (harvests for farm)
- cropCycleId (harvests from cycle)
- harvestDate (date-range queries)

**AuditLog**:
- farmId (audit trail for farm)
- userId (changes by user)
- entityType (changes to entity type)
- entityId (changes to specific entity)
- createdAt (temporal queries)

**Notification**:
- farmId (notifications for farm)
- type (filter by type)
- read (unread notifications)
- createdAt (recent notifications)

**MediaFile**:
- relatedEntityType (media for entity type)
- relatedEntityId (media for specific entity)
- createdAt (recent media)

## Multi-Farm Isolation

The database enforces farm-scoped data isolation through:

1. **Foreign Key Constraints**: Most entities have farmId that references Farm
2. **Unique Constraints**: Farm-scoped uniqueness (e.g., Livestock tagNumber per farm)
3. **Application-Level Enforcement**: Backend must verify user's farm membership before allowing access
4. **Indexes**: farmId indexes enable efficient filtering

**Pattern**:
```javascript
// Example: Get activities for a farm (user must be member)
const activities = await prisma.farmActivity.findMany({
  where: {
    farmId: userFarmId,  // Scoped to farm
  },
});
```

## Data Integrity Scenarios

### Scenario 1: One User Owns Multiple Farms
```javascript
User (Alice)
├── Farm A (owned by Alice)
├── Farm B (owned by Alice)
└── Farm C (owned by Alice)
```
Supported by: User.ownedFarms relation

### Scenario 2: Multiple Users Access One Farm
```javascript
Farm A
├── FarmMember (Alice, role=OWNER)
├── FarmMember (Bob, role=MANAGER)
└── FarmMember (Charlie, role=WORKER)
```
Supported by: FarmMember junction table

### Scenario 3: Worker Has Multiple Farms
```javascript
Worker (Bob)
├── Farm A (role=WORKER)
└── Farm B (role=MANAGER)
```
Supported by: User.farmMembers + Role-based access control

### Scenario 4: Same Animal Tag in Different Farms
```javascript
Farm A: Animal with tagNumber="PIG-001"
Farm B: Animal with tagNumber="PIG-001"  ✓ Allowed (farm-scoped uniqueness)
```
Supported by: @@unique([farmId, tagNumber]) constraint

### Scenario 5: Crop Cycle in Specific Field
```javascript
Field A
├── CropCycle 2025-01 (Maize)
└── CropCycle 2025-02 (Cassava)  - after harvest rotation

Farm A
└── Field B
    └── CropCycle 2025-01 (Tomato)
```
Supported by: CropCycle.fieldId foreign key + Farm context

### Scenario 6: Expense Associated with Enterprise
```javascript
Expense (fertilizer purchase GHS 500)
├── Associated with CropCycle (optional)
└── Associated with Livestock (optional)
```
Supported by: Optional foreign keys on Expense

### Scenario 7: Sale From Crop or Animal
```javascript
Sale (1000 kg Maize @ GHS 25/kg = GHS 25,000)
└── Associated with CropCycle

Sale (3 Pigs @ GHS 2,000 each = GHS 6,000)
└── Associated with Livestock (multiple possible)
```
Supported by: Optional cropCycleId/livestockId on Sale

### Scenario 8: Deleting Farm Preserves History
```javascript
Farm (deleted)
├── AuditLog entries ✓ Preserved (onDelete: Cascade to farm, RESTRICT from users)
└── Sale records ✓ Preserved (onDelete: Cascade to farm, RESTRICT from cycles)
```
Supported by: RESTRICT on user references + Cascade on farm references

### Scenario 9: Pig Mating Record
```javascript
BreedingRecord
├── Female: Pig F-001 (alive)
├── Male: Pig M-001 (sold later - can be deleted)
├── Mating Date: 2025-01-15
└── Outcome: 8 piglets
```
Supported by: maleId nullable (SET NULL on delete)

### Scenario 10: Historical Event Dates Distinct
```javascript
LivestockEvent (VACCINATION)
├── Event Date: 2025-01-15 (when vaccination happened)
├── Recorded At: 2025-01-17 (when farmer entered data)
└── Created At: 2025-01-17T14:30:00Z (database timestamp)
```
Supported by: Separate eventDate vs. createdAt fields

## Migration Strategy

### Phase 1: Schema Validation
- ✅ Prisma schema file created and validated
- ✅ Prisma Client generated
- Migration file ready to deploy when database available

### Phase 2: Database Connection
- Create PostgreSQL database instance
- Set DATABASE_URL in .env file
- Run: `npx prisma migrate dev --name initial_farmwise_schema`

### Phase 3: Data Population
- Optional: seed database with initial data (system roles, permissions, default crops, species)
- Create seed.ts file with seeding logic

## Backend Integration

### Initializing Prisma Client
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

### Common Queries

**Find farms for a user**:
```javascript
const farms = await prisma.farm.findMany({
  where: { ownerId: userId },
  include: { owner: true, farmMembers: true }
});
```

**Get all activities for a farm**:
```javascript
const activities = await prisma.farmActivity.findMany({
  where: { farmId },
  include: { user: true },
  orderBy: { activityDate: 'desc' }
});
```

**Record animal event**:
```javascript
await prisma.livestockEvent.create({
  data: {
    livestockId,
    eventType: 'MATING',
    eventDate: new Date('2025-01-15'),
    description: 'Mating recorded',
    recordedAt: new Date()
  }
});
```

**Create crop cycle**:
```javascript
await prisma.cropCycle.create({
  data: {
    farmId,
    fieldId,
    cropId,
    status: 'PLANNING',
    plantingDate: new Date('2025-02-01'),
    expectedHarvestDate: new Date('2025-05-01')
  }
});
```

## Documentation References

- **Schema File**: [database/prisma/schema.prisma](../prisma/schema.prisma)
- **Migrations**: [database/prisma/migrations/](../prisma/migrations/)
- **Entity Relationship Diagram**: [DATABASE_ERD.md](./DATABASE_ERD.md)
- **Design Decisions**: [DATABASE_DESIGN_DECISIONS.md](./DATABASE_DESIGN_DECISIONS.md)

## Next Steps (Sprint 3)

- Implement authentication endpoints (user registration, login, 2FA) ❌ Do NOT implement - wait for next sprint
- Implement role-based access control middleware
- Implement audit logging service
- Create database seeders for test data
- Set up database backups and disaster recovery
- Performance testing and index optimization
