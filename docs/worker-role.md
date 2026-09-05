# Farm Worker Role

## Status

The Farm Worker foundation is implemented for the web application. It reuses the existing JWT authentication, OTP verification, `FarmMember` relationship, farm activity/task models, notifications, community, and audit infrastructure.

## Role and assignment

`FARM_WORKER` is the canonical system role. `WORKER` remains a compatibility alias for existing accounts. A worker receives no farm access from the system role alone: an active `FarmMember` row with role `WORKER` or `FARM_WORKER` is required.

Workers may be assigned to multiple farms. Each assignment is independent and is checked by `requireFarmAccess`; inactive assignments lose access immediately while historical records remain.

## Farm-scoped permissions

`WorkerFarmPermission` connects a farm membership to a permission definition and records the user who granted it. The farmer/manager endpoints are:

- `GET /api/v1/farms/:farmId/workers`
- `GET /api/v1/farms/:farmId/workers/:memberId/permissions`
- `PUT /api/v1/farms/:farmId/workers/:memberId/permissions`

The update payload is `{ "permissionCodes": ["VIEW_CROP", "CREATE_ACTIVITY"] }`. Unknown permission codes are ignored by the current Prisma lookup and should be rejected by the client before submission; tightening this to a 400 response is a follow-up hardening item.

## Worker dashboard and tasks

- `GET /api/v1/worker/dashboard` returns assigned farms, the worker's assigned open tasks, recent activities, and alerts for assigned farms.
- `GET /api/v1/worker/tasks` lists only tasks assigned to the authenticated worker.
- `PATCH /api/v1/worker/tasks/:taskId` permits status and notes changes only on the worker's own task.

The web dashboard is rendered from these backend responses and does not use placeholder statistics.

## Authorization and isolation

Authentication and role checks run before worker routes. Farm-scoped `requirePermission` checks use `WorkerFarmPermission` for workers rather than global role permissions. Resource queries also constrain by the authenticated worker, assigned farm, or assigned task, providing IDOR protection for worker dashboard/task access.

## Existing modules

The worker role is connected to the existing activity/task, crop, livestock, inventory, community, messaging, and notification route families. Those existing routes still need a complete permission-by-permission worker policy rollout before the whole product can be declared complete; the worker dashboard and task slice are the first enforced surface.

## Verification

- `npx prisma validate --schema=prisma/schema.prisma`
- `npx prisma generate --schema=prisma/schema.prisma`
- `npm test` in `backend/`
- `npm run build` in `frontend/`

The database SQL artifact is `backend/prisma/migration-worker-role.sql`. It must be applied through the deployment database process before the worker permission endpoints are used.