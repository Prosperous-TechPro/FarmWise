# Farmer / Farm Owner Role

## Status

`FARM_OWNER` is the platform role for a farmer who owns and operates one or more farms. Farm-level membership roles remain separate: `OWNER`, `MANAGER`, and `WORKER`.

The backend determines ownership from the authenticated user and the `Farm.ownerId` relationship. Client-supplied `ownerId`, `farmerId`, or `farmOwnerId` values are not used to establish ownership.

## Authorization and Isolation

Authenticated requests are checked by the existing middleware stack:

1. JWT authentication and active, verified account status.
2. Platform role or permission checks where required.
3. Farm access through ownership or an active `FarmMember` record.
4. Farm membership role checks for management operations.
5. Resource-to-farm relationship checks in services.

A farmer can access owned farms and farms where they are an active member. A farm ID from another farmer returns access denied. Farm-scoped crop, finance, inventory, livestock, activity, analytics, and report operations use the same farm context.

Field detail, update, and delete operations also verify that the field belongs to the URL farm before returning or changing it. This prevents cross-farm IDOR when a field ID is known.

## Farmer Dashboard

The existing web application provides the authenticated dashboard and loads:

- `GET /api/v1/dashboard/overview` for the user's accessible farm portfolio.
- `GET /api/v1/farms/:farmId/dashboard` for the selected farm's operational aggregate.

The dashboard farm selector only selects from farms returned by the backend. The backend still performs the authoritative access check.

Selected-farm metrics are calculated from backend records and include active workers, active crop cycles, livestock, inventory items, revenue, expenses, and net profit/loss when the corresponding modules provide data. Financial values come from sales, expenses, and financial losses; the dashboard does not accept manually entered totals. Missing financial data is shown as unavailable or incomplete.

## Existing Farm and Crop APIs

The implementation extends the existing APIs rather than creating duplicate systems:

- `GET /api/v1/farms`
- `POST /api/v1/farms`
- `GET /api/v1/farms/:farmId`
- `PUT /api/v1/farms/:farmId`
- `DELETE /api/v1/farms/:farmId`
- `GET /api/v1/farms/:farmId/crops`
- `POST /api/v1/farms/:farmId/crops`
- `GET /api/v1/farms/:farmId/crops/:cropCycleId`
- `PUT /api/v1/farms/:farmId/crops/:cropCycleId`
- `POST /api/v1/farms/:farmId/crops/:cropCycleId/archive`
- `GET /api/v1/farms/:farmId/workers`
- `POST /api/v1/farms/:farmId/workers`
- `PATCH /api/v1/farms/:farmId/workers/:memberId`
- `DELETE /api/v1/farms/:farmId/workers/:memberId`
- `GET /api/v1/farms/:farmId/dashboard`

Crop cycles remain linked to their farm and field. Crop services verify that a referenced field belongs to the requested farm.

## Workers and Permissions

Workers are represented by `FarmMember` records and may be assigned `WORKER` or `MANAGER` membership roles. Existing RBAC permissions govern actions such as viewing crops, creating crop records, recording activities, and viewing or recording financial data. Farmers cannot promote themselves to platform administrators or change another farmer's farm ownership.

Worker-management routes are restricted to farm owners and managers by the existing farm-role middleware. High-impact worker and historical-record actions should remain subject to the existing confirmation and audit conventions.

## Historical Records and Financial Architecture

Crop cycles support completed, cancelled, abandoned, and archived states. Financial summaries are derived from authoritative sale, expense, and financial-loss transactions. The calculation path is:

`transactions -> analytics repository aggregates -> farm dashboard service -> Farmer dashboard`

No marketplace, payment gateway, advanced prediction engine, or unsupported veterinary diagnosis is implemented by this role.

## Existing Integrations and Future Work

The Farmer uses the existing community, notification, activity, inventory, livestock, finance, and profile integrations where those modules are available. Private messaging and news-feed behavior remain owned by their existing modules; no second implementation is introduced.

Further production work should add route-level integration tests covering two-user cross-farm access for every enabled resource, worker permission grants and revocations, audit-event assertions, and Android Farmer screens if the mobile application is brought into this release scope.

## Verification

Backend:

```text
cd backend
npm test
```

Result during implementation: 137 tests passed.

Frontend:

```text
cd frontend
npm run build
```

Result during implementation: production build passed.
