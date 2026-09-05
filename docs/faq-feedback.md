# Global FAQ and Feedback

## Architecture

FAQ content is global and normalized across `FAQCategory`, `FAQ`, and `FAQFeedback`. Published FAQ search is server-side and paginated. Each authenticated user has one helpfulness vote per FAQ.

Feedback is normalized across `Feedback`, `FeedbackResponse`, `FeedbackInternalNote`, and `FeedbackAttachment`. User-visible responses and administrator-only notes are stored separately and are never returned together to normal users.

The feature reuses FarmWise JWT authentication, RBAC middleware, Prisma, the existing `MediaFile` foundation, `AuditLog`, `Notification`, and the global API rate limiter.

## Permissions

The seed adds:

- `MANAGE_FAQS`: create, edit, publish, archive, and categorize FAQ content.
- `MANAGE_FEEDBACK`: review, assign, update, respond to, and resolve feedback.

All admin endpoints require both an admin role and the relevant permission. Frontend visibility is not used as authorization.

## API

Authenticated user endpoints:

- `GET /api/v1/faqs`
- `GET /api/v1/faqs/categories`
- `GET /api/v1/faqs/:faqId`
- `POST /api/v1/faqs/:faqId/helpful`
- `POST /api/v1/feedback`
- `GET /api/v1/feedback/my`
- `GET /api/v1/feedback/my/:feedbackId`

Administrator endpoints:

- `GET /api/v1/admin/faqs`
- `POST /api/v1/admin/faqs`
- `PATCH /api/v1/admin/faqs/:faqId`
- `POST /api/v1/admin/faqs/:faqId/status`
- `GET|POST /api/v1/admin/faqs/categories`
- `PATCH /api/v1/admin/faqs/categories/:categoryId`
- `GET /api/v1/admin/feedback`
- `GET /api/v1/admin/feedback/:feedbackId`
- `PATCH /api/v1/admin/feedback/:feedbackId`
- `POST /api/v1/admin/feedback/:feedbackId/respond`
- `POST /api/v1/admin/feedback/:feedbackId/internal-note`

## Security

Feedback IDs are always queried with the authenticated user ID for user endpoints. Internal notes are never returned by user detail queries. Status, priority, assignment, resolution, and closure fields can only be changed by administrators. User IDs, roles, and permissions are derived from the authenticated request.

Feedback submissions generate an audit record and in-app notifications for active administrators. Responses notify only the feedback owner. Helpful votes use an upsert to prevent duplicate votes from the same authenticated user.

The existing media schema is linked through `FeedbackAttachment`, but the repository currently has no uploader-owned upload endpoint. Arbitrary client file references are therefore not accepted by the feedback API until that existing media foundation gains uploader ownership and safe upload handling.

## Migration and seed

Review and apply `backend/prisma/migration-faq-feedback.sql` through the normal PostgreSQL deployment process, then run the existing backend seed to create support permissions and default FAQ categories. Generate the Prisma client after applying schema changes.

## Frontend

`GlobalFAQButton` is mounted once in `DashboardLayout`, so it follows authenticated navigation without being duplicated per page. It provides responsive FAQ search, category context, expandable answers, helpfulness controls, feedback submission, Escape-to-close behavior, and dialog focus management. `AdminSupport` adds FAQ publishing and feedback queue/detail workflows to the existing admin sidebar.

## Verification

- Prisma schema validation passes.
- Backend tests pass, including support validator tests.
- Frontend production build passes.
- Existing frontend lint still reports a pre-existing unescaped apostrophe in `frontend/src/components/FinanceRecords.jsx`.
