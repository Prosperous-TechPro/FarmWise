import * as supportService from '../services/supportService.js';

export async function listFAQs(req, res) { return res.json({ success: true, ...(await supportService.getFAQs(req.query)) }); }
export async function listFAQCategories(req, res) { return res.json({ success: true, data: await supportService.getFAQCategories() }); }
export async function getFAQ(req, res) { return res.json({ success: true, data: await supportService.getFAQ(req.params.faqId) }); }
export async function helpfulFAQ(req, res) { return res.json({ success: true, data: await supportService.rateFAQ(req.params.faqId, req.user.id, req.body.helpful, req) }); }
export async function submitFeedback(req, res) { return res.status(201).json({ success: true, data: await supportService.submitFeedback(req.user.id, req.body, req), message: 'Thank you. Your feedback has been submitted successfully.' }); }
export async function myFeedback(req, res) { return res.json({ success: true, ...(await supportService.getMyFeedbackHistory(req.user.id, req.query)) }); }
export async function myFeedbackDetail(req, res) { return res.json({ success: true, data: await supportService.getOwnedFeedback(req.user.id, req.params.feedbackId) }); }

export async function adminFAQs(req, res) { return res.json({ success: true, ...(await supportService.getAdminFAQList(req.query)) }); }
export async function createFAQ(req, res) { return res.status(201).json({ success: true, data: await supportService.createFAQService(req.user.id, req.body, req) }); }
export async function updateFAQ(req, res) { return res.json({ success: true, data: await supportService.editFAQService(req.user.id, req.params.faqId, req.body, req) }); }
export async function updateFAQStatus(req, res) { return res.json({ success: true, data: await supportService.setFAQStatus(req.user.id, req.params.faqId, req.body.status, req) }); }
export async function faqCategories(req, res) { return res.json({ success: true, data: await supportService.getFAQCategories(true) }); }
export async function createFAQCategory(req, res) { return res.status(201).json({ success: true, data: await supportService.createFAQCategoryService(req.user.id, req.body, req) }); }
export async function updateFAQCategory(req, res) { return res.json({ success: true, data: await supportService.editFAQCategoryService(req.user.id, req.params.categoryId, req.body, req) }); }

export async function adminFeedback(req, res) { return res.json({ success: true, ...(await supportService.getAdminFeedbackList(req.query)) }); }
export async function adminFeedbackDetail(req, res) { return res.json({ success: true, data: await supportService.getAdminFeedbackDetail(req.params.feedbackId) }); }
export async function patchFeedback(req, res) { return res.json({ success: true, data: await supportService.patchAdminFeedback(req.user.id, req.params.feedbackId, req.body, req) }); }
export async function respondFeedback(req, res) { return res.status(201).json({ success: true, data: await supportService.respondToFeedback(req.user.id, req.params.feedbackId, req.body.message, req, false) }); }
export async function noteFeedback(req, res) { return res.status(201).json({ success: true, data: await supportService.addInternalNote(req.user.id, req.params.feedbackId, req.body.note, req) }); }