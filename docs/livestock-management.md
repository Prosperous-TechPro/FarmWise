# Livestock Management

FarmWise uses a species-neutral livestock core with pig production extensions. The existing `Livestock`, `LivestockSpecies`, and `LivestockBreed` models support individual animals, parent links, status, acquisition, and current weight. Historical records are stored separately and are never overwritten.

## Historical APIs

All endpoints require authentication and farm access:

- `GET|POST /api/v1/farms/:farmId/livestock/:livestockId/events`
- `GET|POST /api/v1/farms/:farmId/livestock/:livestockId/weights`
- `GET|POST /api/v1/farms/:farmId/livestock/:livestockId/health`
- `GET|POST /api/v1/farms/:farmId/livestock/:livestockId/treatments`
- `GET|POST /api/v1/farms/:farmId/livestock/:livestockId/vaccinations`
- `GET|POST /api/v1/farms/:farmId/livestock/:livestockId/feeding`

Write operations are limited to farm owners, managers, and workers by the current livestock route policy. The service layer independently verifies that the animal belongs to the requested farm.

## Validation

The backend validates event types, dates, positive weights and quantities, enum units, non-negative costs, and chronological treatment/vaccination dates. Historical records are append-only through these APIs.

## Frontend

The Livestock record profile shows tabs for events, weights, health, treatments, vaccinations, and feeding. Weight and health records can be entered directly from the profile; other record types are read-ready through the same API surface.

## Testing

```powershell
cd backend
npm test

cd ../frontend
npm run build
```
