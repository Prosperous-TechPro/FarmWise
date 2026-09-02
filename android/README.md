# FarmWise Android Foundation

Native Kotlin/XML Android foundation for FarmWise. The app never connects to PostgreSQL; it communicates with the REST API through Retrofit over HTTPS in release builds.

## Architecture

`presentation -> repository -> Retrofit API -> FarmWise backend`

The Android app uses XML layouts, Fragments, lifecycle coroutines, Navigation Component, View Binding, and a small repository boundary. `TokenStore` uses `EncryptedSharedPreferences` backed by an Android `MasterKey`; passwords, OTP codes, access tokens, and refresh tokens are not stored in ordinary preferences, Room, or logs.

Package structure:

```text
com.farmwise.app
├── core/network       Retrofit, OkHttp authorization interceptor
├── core/security      encrypted session token storage
├── data/api           AuthApi, DashboardApi, FarmApi, NotificationApi
├── data/models        API DTOs
├── data/repository    AuthRepository
├── presentation/auth  login, registration, OTP/2FA verification
├── presentation/dashboard
├── presentation/common
└── MainActivity       navigation shell and session startup
```

The current navigation shell has Home, Farms, Tasks, and More destinations. The shell is ready for feature fragments for crops, livestock, inventory, expenses, sales, production, activities, alerts, reports, profile, and settings without changing the API/network boundary. Placeholder module destinations intentionally do not contain fake production data.

## Farm management and context

Farm management follows `FarmListFragment -> FarmViewModel -> FarmRepository -> FarmApi`. `FarmListFragment` uses a RecyclerView and reusable `FarmAdapter`/`item_farm.xml` card, with loading, empty, error, retry, and swipe-to-refresh states. `AddFarmFragment`, `FarmDetailsFragment`, and `EditFarmFragment` use only the existing backend fields and endpoints. Status editing supports the backend values `ACTIVE`, `INACTIVE`, and `ARCHIVED`.

`FarmContextStore` persists only the non-sensitive current farm ID in a user-scoped local preference. The list is fetched from the backend before the stored ID is restored; if it is no longer accessible, the first accessible farm is selected instead. Logout clears this context along with encrypted authentication tokens. Farm IDs are never treated as authorization: backend `requireFarmAccess` remains authoritative.

## Build configuration

- Debug API base URL: emulator loopback `http://10.0.2.2:3000/api/v1/`
- Release API base URL: `https://api.farmwise.example/api/v1/` placeholder that must be replaced in deployment configuration
- Minimum SDK: 26
- Target/compile SDK: 35
- Java/Kotlin target: 17
- XML only; Jetpack Compose is not used

Dependencies are deliberately limited to AndroidX core/appcompat/fragment/activity/lifecycle, Navigation Component, RecyclerView, Material Components, Retrofit/Gson, OkHttp logging, Kotlin coroutines, Android security crypto, and JUnit/AndroidX test libraries.

## Sprint 13 farm module

The farm module uses `FarmListFragment`, `AddFarmFragment`, `FarmDetailsFragment`, and `EditFarmFragment`. The list is backed by `RecyclerView` and a reusable farm-card layout, supports swipe-to-refresh, and exposes empty/loading/error states. The selected farm is stored by `FarmContextStore` and restored only after the backend returns the user's currently accessible farms. Selecting a farm updates the shared context; logout clears it with the session tokens.

The API client uses only the existing backend operations: `GET /farms`, `GET /farms/:farmId`, `POST /farms`, and `PUT /farms/:farmId`. The backend currently has no farm type or farm-size fields, so the Android forms do not invent them. Farm status editing uses `ACTIVE`, `INACTIVE`, and `ARCHIVED`.

## Sprint 14 crop and field module

Field management follows `FieldListFragment -> FieldViewModel -> FieldRepository -> FieldApi`, with reusable field cards and farm-scoped list/detail/create/edit operations. Crop-cycle management follows `CropCycleListFragment -> CropViewModel -> CropRepository -> CropApi`. Crop types are loaded from `GET /crops`; no crop names are hard-coded into the architecture. Crop cycles are created and displayed using the existing farm-scoped crop endpoints, including field, planting, expected harvest, area, season, and notes. The repository also exposes existing activity, input, production, and harvest endpoints, including production and harvest creation.

The current Sprint 14 UI covers field list, add, details, edit, crop-cycle list, add, and details. Activity/input/production/harvest history and entry screens remain backend/data-layer foundations rather than completed UI workflows.

## Sprint 15 livestock module

Livestock management follows `AnimalListFragment -> LivestockViewModel -> LivestockRepository -> LivestockApi`. The module includes a RecyclerView animal list, registration form, animal profile, breeding history, and mating form. Species and breeds are loaded from backend data, and animals are always requested under `FarmContextStore.currentFarmId`.

`BreedingDateCalculator` is the single local display-preview location for the configurable default pig gestation period of 114 days. The mating request is submitted to the backend, which returns the authoritative `expectedFarrowingDate`; the Android estimate is explicitly labeled as a preview and is not used as authorization or persisted business data. Expected and actual farrowing fields remain separate in the DTO.

The backend currently does not expose dedicated Android routes for weight history, health records, feeding, mortality/farrowing updates, livestock expenses, or livestock sales. The Android client does not invent those routes; those capabilities remain documented backend gaps for the livestock UI.

## Sprint 17 inventory module

Inventory follows `InventoryDashboardFragment -> InventoryViewModel -> InventoryRepository -> InventoryApi`. The module includes a backend-backed summary and paginated-ready item list, item creation, receive-stock, and record-usage forms. `InventoryRepository` obtains the current farm from `FarmContextStore` for every operation; it never calculates or mutates stock balances locally. Receipt and issue payloads preserve units and optional crop-cycle, livestock, field, and activity references.

The current inventory API exposes item catalog, summary, storage locations, receipts, issues, transfers, and adjustments. The Android layer exposes the first item/receipt/issue workflows and validates quantities, costs, expiry dates, and allocation requirements. Inventory value is not invented because the backend summary currently provides no valuation method. Transaction detail, adjustment, transfer, loss, return, supplier, and server-side pagination UI remain backend/UI follow-up work.

## Sprint 18 harvest and production module

Production follows `ProductionDashboardFragment -> ProductionViewModel -> ProductionRepository -> CropApi`. The module provides a farm-context-bound production/harvest overview, harvest history cards, harvest details, and separate harvest and production entry forms. A harvest does not create a sale and preserves the crop-cycle relationship in its request. Multiple harvest events remain separate list records.

`YieldCalculator` is the single Android presentation helper for optional yield display. It returns a value only when production is positive, the area is positive, production is in kilograms, and area is in acres or hectares; otherwise it returns a reason such as `FIELD_AREA_MISSING` or `INCOMPATIBLE_PRODUCTION_UNIT`. The backend remains authoritative for stored production and harvest business rules.

The current backend Harvest model supports crop cycle, quantity, unit, grade, damage percentage, date, notes, and audit timestamps. It does not expose harvest time, worker/team, storage destination, partial/final status, loss records, harvest updates, or direct harvest detail lookup. Those fields and operations remain explicit backend gaps rather than invented Android endpoints.

## Sprint 19 sales module

Sales follows `SalesDashboardFragment -> SalesViewModel -> SalesRepository -> SalesApi`. The Android module provides a farm-context-bound sales list/dashboard and sale creation form using the backend's supported sale number, total amount, currency, payment method, status, buyer text, date, and notes fields. Client validation is for user feedback only; the backend remains authoritative for totals, revenue treatment, and authorization. Sales remain separate from harvests, production, and expenses.

The current backend has no `Customer`, `Payment`, partial-payment, sale-detail, sale-update/cancel, produce-availability, harvest relationship, livestock relationship, or revenue-summary endpoints. The Android client does not invent those APIs. Customer management, amount paid/outstanding, payment history, product quantities/items, and produce stock validation remain backend gaps.

## Sprint 20 financial analytics

Financial analytics follows `FinancialDashboardFragment -> FinancialViewModel -> FinancialRepository -> FinancialApi`. The dashboard reads `/farms/:farmId/profitability` and the farm dashboard's backend financial status; expense breakdown reads `/analytics/expenses`, and trend data reads `/analytics/trends`. No duplicate transaction tables or client-side accounting records are created.

`FinancialStatus` is the single presentation fallback for no activity, loss, and break-even; when the backend supplies a status, that status is displayed unchanged. Profit/loss values and margins are backend-derived. The UI uses the existing semantic resources: profit gold, manageable yellow, loss red, with text labels as well.

The backend currently lacks payments/outstanding revenue, revenue breakdown, crop/crop-cycle profitability, livestock profitability, financial alert rules, date-filtered profitability, and a dedicated revenue summary endpoint. The Android financial module therefore provides the supported farm summary and expense breakdown only, without inventing unsupported accounting behavior.

## Sprint 16 daily operations

Daily operations follows `DailyOperationsFragment -> ActivityViewModel -> ActivityRepository -> ActivityApi`. The activity list and details screens are farm-context-bound and support the backend's generic activity records, including title, description, category, status, date/time, field, crop cycle, livestock, quantity, unit, cost, and notes. `AddActivityFragment` disables submission while the request is in flight and validates the backend-supported activity categories before recording work.

The backend currently exposes activity-type listing, activity listing/detail/creation, and task listing/creation only as tasks nested under an activity. It does not expose standalone task listing, assignment updates, completion updates, farm worker listing, activity editing, daily summary, or server-side date filtering. The Android Tasks destination states this capability gap rather than presenting an unsupported workflow. Activity-to-task and worker selection remain ready for those backend contracts.

## Backend integrations

Implemented client calls target existing endpoints for login, registration, OTP verification, logout, token refresh, dashboard overview, farm listing, farm details, farm creation, farm updates, and notification unread/list APIs. Login chooses the backend's `email` or `phone` field based on the entered identifier. The backend currently has no dedicated 2FA verification endpoint, so the 2FA screen is a visible integration gap and does not bypass authentication.

## UI and security

Theme resources centralize FarmWise green/white/black branding and semantic loss/manageable/profit status colors. Financial status is presented with text, not color alone. API logs are BASIC in debug and disabled in release. No server secrets, Hubtel keys, JWT secrets, passwords, or OTP values are included in the Android project.

## Verification

The workspace does not have a Gradle wrapper, system Gradle installation, Android SDK, or ADB, so `./gradlew build` could not be run in this environment. Build verification and UI tests must be performed in Android Studio or with compatible Android tooling. Static checks found no unresolved Safe Args references; Kotlin/XML files and Gradle configuration are ready for that build path.
