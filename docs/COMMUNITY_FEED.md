# FarmWise Community Feed

The Community Feed is an authenticated, user-generated space for agricultural tips, questions, experiences, farm updates, images, and videos. It is separate from private farm records and never publishes financial, livestock, worker, customer, or authentication data automatically.

## Permissions

Any authenticated FarmWise user may read the feed, publish posts, react, comment, and report content. Users may edit or delete only their own posts and comments. `ADMIN` and `SUPERADMIN` have equal moderation access and may review reports and hide or restore content.

## API

All endpoints use `/api/v1/community` and require a Bearer access token.

- `GET /posts?limit=20&cursor=<postId>` returns latest posts with a next cursor.
- `POST /posts` accepts `{ body, title?, category?, media?: [{ mediaType, dataUrl }] }`.
- `PUT /posts/:postId` edits an owned post; system admins may moderate any post.
- `DELETE /posts/:postId` removes an owned post or an admin-selected post.
- `POST` and `DELETE /posts/:postId/likes` toggle the authenticated user's like.
- `GET /posts/:postId/comments` and `POST /posts/:postId/comments` manage comments.
- `DELETE /comments/:commentId` removes an owned comment or an admin-selected comment.
- `POST /posts/:postId/reports` and `POST /comments/:commentId/reports` create moderation reports.
- `GET /reports` and `POST /moderation` are available to `ADMIN` and `SUPERADMIN`.

## Media and security

The current web implementation accepts validated PNG, JPG, WEBP, MP4, and WEBM data URLs with item limits and size limits. The client never receives storage credentials. User text is rendered as text, not trusted HTML. Post and comment ownership is derived from the authenticated session, not request-provided author IDs.

The normalized database entities are `CommunityPost`, `CommunityPostMedia`, `CommunityLike`, `CommunityComment`, `CommunityReport`, and `CommunityModerationAction`. Likes are unique per user and post. Moderation actions store actor, target, action, reason, and timestamp.

## Future extensions

The model leaves room for follows, groups, bookmarks, reactions, expert verification, and richer media storage without mixing community content with private farm-management entities.
