import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  createComment,
  listComments,
  deleteComment,
  getComment,
  findLike,
  createLike,
  deleteLike,
  createReport,
  listReports,
  createModerationAction,
} from '../repositories/communityRepository.js';

const categories = new Set(['Farming Tips', 'Livestock', 'Crops', 'Poultry', 'Pig Farming', 'Animal Health', 'Farm Management', 'Agriculture Business', 'Equipment', 'Harvest', 'Farm Experience', 'Question', 'General Agriculture']);
const reportReasons = new Set(['SPAM', 'HARASSMENT', 'OFFENSIVE_CONTENT', 'MISLEADING_INFORMATION', 'INAPPROPRIATE_MEDIA', 'OTHER']);

function error(message, statusCode = 400) { const err = new Error(message); err.statusCode = statusCode; return err; }
function cleanText(value, max) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
function validateMedia(media = []) {
  if (!Array.isArray(media) || media.length > 4) throw error('You can attach up to 4 media items');
  return media.map((item) => {
    if (!item || !['image', 'video'].includes(item.mediaType) || typeof item.dataUrl !== 'string') throw error('Invalid community media');
    const allowed = item.mediaType === 'image' ? /^data:image\/(png|jpeg|jpg|webp);base64,/ : /^data:video\/(mp4|webm);base64,/;
    if (!allowed.test(item.dataUrl) || item.dataUrl.length > (item.mediaType === 'image' ? 5 : 25) * 1024 * 1024) throw error('Community media type or size is invalid');
    return { mediaType: item.mediaType, dataUrl: item.dataUrl };
  });
}

export async function getCommunityPosts({ limit = 20, cursor, viewerId }) {
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 20);
  const posts = await listPosts({ limit: pageSize, cursor, viewerId });
  const hasMore = posts.length > pageSize;
  if (hasMore) posts.pop();
  return { posts: posts.map((post) => ({ ...post, viewerLiked: Boolean(post.likes?.length) })), nextCursor: hasMore ? posts[posts.length - 1]?.id : null };
}

export async function createCommunityPost(userId, input) {
  const body = cleanText(input.body, 5000);
  if (!body && !input.media?.length) throw error('Post text or media is required');
  if (input.category && !categories.has(input.category)) throw error('Invalid community category');
  return createPost({ authorId: userId, title: cleanText(input.title, 255) || undefined, body, category: input.category || undefined, media: validateMedia(input.media) });
}

export async function editCommunityPost(userId, postId, input, isAdmin = false) {
  const post = await getPost(postId);
  if (!post) throw error('Post not found', 404);
  if (!isAdmin && post.authorId !== userId) throw error('You can only edit your own posts', 403);
  const body = cleanText(input.body, 5000);
  if (!body) throw error('Post text is required');
  return updatePost(postId, { title: cleanText(input.title, 255) || undefined, body, category: input.category || undefined });
}

export async function removeCommunityPost(userId, postId, isAdmin = false) {
  const post = await getPost(postId);
  if (!post) throw error('Post not found', 404);
  if (!isAdmin && post.authorId !== userId) throw error('You can only delete your own posts', 403);
  return updatePost(postId, { status: 'DELETED' });
}

export async function toggleCommunityLike(userId, postId, liked) {
  const post = await getPost(postId);
  if (!post || post.status !== 'PUBLISHED') throw error('Post not found', 404);
  const existing = await findLike(postId, userId);
  if (liked && !existing) await createLike(postId, userId);
  if (!liked && existing) await deleteLike(postId, userId);
  return { liked, postId };
}

export async function addCommunityComment(userId, postId, input) {
  const post = await getPost(postId);
  if (!post || post.status !== 'PUBLISHED') throw error('Post not found', 404);
  const body = cleanText(input.body, 1000);
  if (!body) throw error('Comment cannot be empty');
  return createComment({ postId, authorId: userId, body });
}

export async function getCommunityComments(postId) {
  const post = await getPost(postId);
  if (!post || post.status !== 'PUBLISHED') throw error('Post not found', 404);
  return listComments(postId);
}

export async function removeCommunityComment(userId, commentId, isAdmin = false) {
  const comment = await getComment(commentId);
  if (!comment) throw error('Comment not found', 404);
  if (!isAdmin && comment.authorId !== userId) throw error('You can only delete your own comments', 403);
  return deleteComment(commentId);
}

export async function reportCommunityContent(userId, input) {
  if ((!input.postId && !input.commentId) || (input.postId && input.commentId)) throw error('Provide a post or comment to report');
  if (!reportReasons.has(input.reason)) throw error('Invalid report reason');
  return createReport({ postId: input.postId || undefined, commentId: input.commentId || undefined, reporterId: userId, reason: input.reason, details: cleanText(input.details, 1000) || undefined });
}

export async function getCommunityReports() { return listReports(); }

export async function moderateCommunityContent(userId, input) {
  const isAllowed = ['HIDE_POST', 'RESTORE_POST', 'HIDE_COMMENT', 'RESTORE_COMMENT'].includes(input.action);
  if (!isAllowed || (!input.postId && !input.commentId) || (input.postId && input.commentId)) throw error('Invalid moderation action');
  const status = input.action.includes('HIDE') ? 'HIDDEN' : 'PUBLISHED';
  if (input.postId) await updatePost(input.postId, { status });
  const action = await createModerationAction({ actorId: userId, postId: input.postId || undefined, commentId: input.commentId || undefined, action: input.action, reason: cleanText(input.reason, 1000) || undefined });
  return action;
}
