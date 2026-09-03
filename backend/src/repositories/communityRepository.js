import prisma from '../lib/prisma.js';

const postInclude = (viewerId) => ({
  author: { select: { id: true, firstName: true, lastName: true, profilePictureUrl: true } },
  media: true,
  comments: {
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'asc' },
    take: 10,
    include: { author: { select: { id: true, firstName: true, lastName: true, profilePictureUrl: true } } },
  },
  _count: { select: { likes: true, comments: true, reports: true } },
  likes: {
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  },
});

export function listPosts({ limit, cursor, viewerId }) {
  return prisma.communityPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: postInclude(viewerId),
  });
}

export function getPost(postId, viewerId) {
  return prisma.communityPost.findUnique({ where: { id: postId }, include: postInclude(viewerId) });
}

export function createPost(data) {
  return prisma.communityPost.create({ data: { ...data, media: data.media?.length ? { create: data.media } : undefined }, include: postInclude(data.authorId) });
}

export function updatePost(postId, data) {
  return prisma.communityPost.update({ where: { id: postId }, data, include: postInclude(data.authorId) });
}

export function createComment(data) {
  return prisma.communityComment.create({ data, include: { author: { select: { id: true, firstName: true, lastName: true, profilePictureUrl: true } } } });
}

export function listComments(postId) {
  return prisma.communityComment.findMany({ where: { postId, status: 'PUBLISHED' }, orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, firstName: true, lastName: true, profilePictureUrl: true } } } });
}

export function deleteComment(commentId) {
  return prisma.communityComment.update({ where: { id: commentId }, data: { status: 'DELETED' } });
}

export function getComment(commentId) {
  return prisma.communityComment.findUnique({ where: { id: commentId } });
}

export function findLike(postId, userId) {
  return prisma.communityLike.findUnique({ where: { postId_userId: { postId, userId } } });
}

export function createLike(postId, userId) {
  return prisma.communityLike.create({ data: { postId, userId } });
}

export function deleteLike(postId, userId) {
  return prisma.communityLike.delete({ where: { postId_userId: { postId, userId } } });
}

export function createReport(data) {
  return prisma.communityReport.create({ data });
}

export function listReports() {
  return prisma.communityReport.findMany({ where: { status: 'OPEN' }, orderBy: { createdAt: 'asc' }, include: { reporter: { select: { id: true, firstName: true, lastName: true } }, post: true } });
}

export function createModerationAction(data) {
  return prisma.communityModerationAction.create({ data });
}

export function prismaTransaction(callback) {
  return prisma.$transaction(callback(prisma));
}
