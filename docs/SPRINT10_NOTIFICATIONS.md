# Sprint 10: Notifications and Alerts

## Architecture

Farm modules publish a small domain event containing `eventId`, `eventType`, `farmId`, safe entity references, `occurredAt`, and non-sensitive metadata. The centralized processor validates the event, applies an event rule, upserts a farm alert by deterministic fingerprint, and creates one in-app notification per authorized farm recipient. Delivery records preserve the future channel state.

`Event -> Rule -> FarmAlert -> User Notification -> Delivery Channel`

## Lifecycles

Alert transitions are `DETECTED -> ACTIVE -> ACKNOWLEDGED -> RESOLVED` or `DISMISSED`. An active alert may be acknowledged, resolved, or dismissed. Resolved and dismissed alerts are terminal. Notifications begin `UNREAD`; they can become `READ`, `ACKNOWLEDGED`, `RESOLVED`, or `DISMISSED`. In-app delivery is immediately `DELIVERED`; external channels remain `PENDING` until a provider is configured.

## Channels and providers

`IN_APP` is implemented. `PUSH`, `EMAIL`, and `SMS` have provider interfaces. SMS notifications are deliberately separate from OTP and expose a future `HubtelSmsNotificationProvider` abstraction without sending messages. Push devices store Android, iOS, and web registrations; push tokens are excluded from device list responses.

## Implemented event rules

Task due/overdue/completed, low/empty/expiring/expired stock, pregnancy and farrowing events, birth, vaccination/medication due, crop activity and harvest approaching, crop problems, losses, profitability changes, budget exceeded, security events, and general farm events.

Event IDs are durable primary keys. Replaying an event returns the original event and processing an already-processed event is a no-op. Alert fingerprints prevent repeated logical alerts.

## API

- `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/:id/read`
- `PATCH /api/v1/notifications/:id/acknowledge`
- `PATCH /api/v1/notifications/:id/dismiss`
- `GET /api/v1/alerts`, `/alerts/active`, `/alerts/unresolved`
- `PATCH /api/v1/alerts/:id/resolve`
- `GET/PATCH /api/v1/notification-preferences`
- `POST/GET /api/v1/devices`, `DELETE /api/v1/devices/:id`
- `POST /api/v1/events` (ADMIN/SUPERADMIN event ingress)

Notification and alert queries are user-authorized, paginated, and indexed. Financial event visibility can be tightened further when the project introduces explicit finance permissions; event ingress itself is administrative-only.

## Database

The Prisma schema adds `FarmAlert`, `NotificationPreference`, `NotificationDevice`, `NotificationDelivery`, and `DomainEvent`, and expands `Notification` with user ownership, severity, status, channel, alert/event references, lifecycle timestamps, and deduplication indexes. Foreign keys enforce user/farm ownership and cascade only where appropriate.

## Background processing

The durable `DomainEvent` status and retry counters provide the job boundary for scheduled task, stock, expiry, livestock, crop, finance, and security monitors. Processing failures are retained as `FAILED` and become `DEAD_LETTER` after three attempts. A queue/cron runner is not started in this sprint because no job infrastructure exists in the repository; modules can call `publishDomainEvent` and a future worker can safely retry `processDomainEvent`.

## Migration note

`npx prisma format`, `npx prisma validate`, and `npx prisma generate` pass. `prisma migrate dev --name notifications_alerts` is blocked because the configured Neon database has no migration history and contains the pre-existing schema; Prisma reports drift and requests a destructive reset. No reset was performed. Generate/apply the migration from a controlled baseline or use the deployment team's established baseline procedure.
