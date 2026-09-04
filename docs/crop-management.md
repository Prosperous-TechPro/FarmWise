# FarmWise Crop Management

## Architecture

FarmWise uses the existing normalized crop architecture:

- `Crop` is a reusable crop type catalog.
- `CropVariety` belongs to a crop type and can be extended without schema changes.
- `CropCycle` is the farm-owned crop production record.
- `Field` provides the plot relationship for each cycle.
- `CropCycleActivity`, `CropCycleInput`, `CropObservation`, `CropGrowthRecord`, `Harvest`, `ProductionRecord`, `Sale`, and `Expense` attach to the cycle through existing relationships.

A crop cycle cannot be created without an existing farm, field in that farm, and crop type.

## API

All endpoints require authentication. Farm-scoped endpoints verify the requested farm before checking crop permissions.

- `GET /api/v1/crops`
- `GET /api/v1/crops/:cropId/varieties`
- `GET /api/v1/farms/:farmId/crops`
- `POST /api/v1/farms/:farmId/crops`
- `GET /api/v1/farms/:farmId/crops/:cropCycleId`
- `PUT /api/v1/farms/:farmId/crops/:cropCycleId`
- `POST /api/v1/farms/:farmId/crops/:cropCycleId/archive`
- `GET|POST /api/v1/farms/:farmId/crops/:cropCycleId/activities`
- `GET|POST /api/v1/farms/:farmId/crops/:cropCycleId/inputs`
- `GET|POST /api/v1/farms/:farmId/crops/:cropCycleId/observations`
- `GET|POST /api/v1/farms/:farmId/crops/:cropCycleId/growth-records`

Crop lists support farm-scoped `search`, `cropId`, `fieldId`, `status`, `plantingFrom`, `plantingTo`, `harvestFrom`, `harvestTo`, `skip`, and `limit` filters.

## Authorization

- Farm Owners can use crop permissions on farms they own.
- Workers require explicit permission grants; role membership alone is not sufficient.
- `VIEW_CROP` protects reads.
- `CREATE_CROP_RECORD` protects new cycles and inputs.
- `UPDATE_CROP_RECORD` protects updates and archive actions.
- `RECORD_CROP_ACTIVITY` protects activities, observations, and growth records.
- System administrators follow the existing explicit system-admin policy.
- The server derives farm ownership and creator identity from authenticated context. `ownerId`, `userId`, and `workerId` request fields are not trusted.

## Validation and history

Backend validation enforces controlled status values, positive structured area, valid area units, required field and crop relationships, and harvest dates that are not before planting. Crop cycles are archived rather than deleted, preserving future harvest, sales, cost, and audit relationships.

Important create, update, status-change, and archive actions write `AuditLog` records containing the user, farm, crop-cycle entity, action, timestamp, and request context. Authentication secrets are never included.

## Web and Android

The web Records > Crops view now provides farm selection, server-side search/status filters, crop creation, details, editing, and archive actions.

The Android XML crop-cycle flow remains under `CropCycleListFragment`, `AddCropCycleFragment`, and `CropCycleDetailsFragment`. It uses the existing `FarmContextStore`, Retrofit API, repository, and navigation graph. Crop details now expose creator provenance and an archive confirmation action.

The Android build wrapper is not present in this checkout, so Android compilation must be run from an environment with the project Gradle wrapper or Gradle installed.

## Future integration

Harvests remain separate records, allowing multiple harvests per cycle. Inputs, labour, sales, inventory, revenue, and profit/loss should continue to derive from their authoritative transaction models rather than editable totals on `CropCycle`.
