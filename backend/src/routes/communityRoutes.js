import express from 'express';
import { authenticate, authorize, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  listPosts, createPost, updatePost, deletePost, likePost, unlikePost,
  listComments, createComment, deleteComment, reportContent, reportComment,
  listReports, moderateContent,
} from '../controllers/communityController.js';

const router = express.Router();
router.use(authenticate, authorize);
router.get('/posts', asyncHandler(listPosts));
router.post('/posts', asyncHandler(createPost));
router.put('/posts/:postId', asyncHandler(updatePost));
router.delete('/posts/:postId', asyncHandler(deletePost));
router.post('/posts/:postId/likes', asyncHandler(likePost));
router.delete('/posts/:postId/likes', asyncHandler(unlikePost));
router.get('/posts/:postId/comments', asyncHandler(listComments));
router.post('/posts/:postId/comments', asyncHandler(createComment));
router.delete('/comments/:commentId', asyncHandler(deleteComment));
router.post('/posts/:postId/reports', asyncHandler(reportContent));
router.post('/comments/:commentId/reports', asyncHandler(reportComment));
router.use(requireRole(['ADMIN', 'SUPERADMIN']));
router.get('/reports', asyncHandler(listReports));
router.post('/moderation', asyncHandler(moderateContent));
export default router;
