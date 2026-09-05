import express from 'express';
import {
  adminFAQs, adminFeedback, adminFeedbackDetail, createFAQ, createFAQCategory, faqCategories, getFAQ, helpfulFAQ,
  listFAQCategories, listFAQs, myFeedback, myFeedbackDetail, noteFeedback, patchFeedback, respondFeedback, submitFeedback,
  updateFAQ, updateFAQCategory, updateFAQStatus,
} from '../controllers/supportController.js';
import { authenticate, authorize, requirePermission, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate, authorize);

router.get('/faqs/categories', asyncHandler(listFAQCategories));
router.get('/faqs', asyncHandler(listFAQs));
router.get('/faqs/:faqId', asyncHandler(getFAQ));
router.post('/faqs/:faqId/helpful', asyncHandler(helpfulFAQ));
router.post('/feedback', asyncHandler(submitFeedback));
router.get('/feedback/my', asyncHandler(myFeedback));
router.get('/feedback/my/:feedbackId', asyncHandler(myFeedbackDetail));

router.use('/admin', requireRole(['ADMIN', 'SUPERADMIN']));
router.get('/admin/faqs/categories', requirePermission('MANAGE_FAQS'), asyncHandler(faqCategories));
router.post('/admin/faqs/categories', requirePermission('MANAGE_FAQS'), asyncHandler(createFAQCategory));
router.patch('/admin/faqs/categories/:categoryId', requirePermission('MANAGE_FAQS'), asyncHandler(updateFAQCategory));
router.get('/admin/faqs', requirePermission('MANAGE_FAQS'), asyncHandler(adminFAQs));
router.post('/admin/faqs', requirePermission('MANAGE_FAQS'), asyncHandler(createFAQ));
router.patch('/admin/faqs/:faqId', requirePermission('MANAGE_FAQS'), asyncHandler(updateFAQ));
router.post('/admin/faqs/:faqId/status', requirePermission('MANAGE_FAQS'), asyncHandler(updateFAQStatus));
router.get('/admin/feedback', requirePermission('MANAGE_FEEDBACK'), asyncHandler(adminFeedback));
router.get('/admin/feedback/:feedbackId', requirePermission('MANAGE_FEEDBACK'), asyncHandler(adminFeedbackDetail));
router.patch('/admin/feedback/:feedbackId', requirePermission('MANAGE_FEEDBACK'), asyncHandler(patchFeedback));
router.post('/admin/feedback/:feedbackId/respond', requirePermission('MANAGE_FEEDBACK'), asyncHandler(respondFeedback));
router.post('/admin/feedback/:feedbackId/internal-note', requirePermission('MANAGE_FEEDBACK'), asyncHandler(noteFeedback));

export default router;