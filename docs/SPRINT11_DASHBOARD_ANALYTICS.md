# Sprint 11: Dashboard and Analytics

## Architecture

Dashboard endpoints are read-only compositions over existing transactional records. The route validates filters, the service enforces farm access and financial visibility, and the analytics repository performs database aggregates. Controllers never calculate financial or production metrics.

`Normalized records -> Aggregate queries -> Analytics service -> Compact dashboard DTO`

## Metrics

Financial summaries use recorded sales, expenses, and estimated financial losses. Net result is `revenue - expenses - losses`; profit margin is null when revenue is zero. Status is `LOSS` for a negative result, `MANAGEABLE` below a 10% positive margin, and `PROFIT` otherwise. No UI colors are returned.

Production is grouped by product and `QuantityUnit`; incompatible units are never added together. Crop and livestock counts use their normalized status fields. Inventory metrics use stock-balance statuses. Tasks and alerts are grouped at database level.

Missing information remains null or omitted rather than being invented. Yield calculations are not reported until a dedicated crop performance query has both production and field area in compatible units.

## Authorization

The user overview only includes owned or active-member farms. Farm dashboards use `requireFarmAccess`. Financial summaries are returned only to owners, managers, administrators, and super administrators; workers receive operational summaries without financial totals. Report requests with a `farmId` perform an independent authorization lookup to prevent IDOR.

## API

- `GET /api/v1/dashboard/overview`
- `GET /api/v1/farms/:farmId/dashboard`
- `GET /api/v1/farms/:farmId/crops/dashboard`
- `GET /api/v1/farms/:farmId/livestock/dashboard`
- `GET /api/v1/farms/:farmId/inventory/dashboard`
- `GET /api/v1/analytics/expenses`
- `GET /api/v1/analytics/sales`
- `GET /api/v1/analytics/production`
- `GET /api/v1/analytics/trends`
- `GET /api/v1/reports/summary`

All analytics endpoints support validated `dateFrom`, `dateTo`, `groupBy`, `farmId`, pagination, and relevant filters. Report output currently supports compact JSON; PDF and CSV providers remain extension points.

## Performance

Aggregations use Prisma `aggregate` and `groupBy` for totals, with selective fields and date predicates. Notification/alert and transactional date indexes are reused. Lists and reports are paginated where record collections are returned. The trend endpoint is intentionally compact but currently groups daily records; a future period-bucketing query can switch to weekly/monthly SQL grouping for very large ranges.

## Boundaries

Sprint 11 does not add denormalized dashboard tables, caching, WebSockets, offline synchronization, AI recommendations, forecasting, or Android UI. A future insight engine can consume the structured dashboard DTOs without changing transactional modules.
