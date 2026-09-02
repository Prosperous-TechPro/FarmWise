import {
  getCommunityPosts,
  createCommunityPost,
  editCommunityPost,
  removeCommunityPost,
  toggleCommunityLike,
  addCommunityComment,
  getCommunityComments,
  removeCommunityComment,
  reportCommunityContent,
  getCommunityReports,
  moderateCommunityContent,
} from '../services/communityService.js';

const isAdmin = (req) => req.user.roles?.some((role) => ['ADMIN', 'SUPERADMIN'].includes(role));

export async function listPosts(req, res) { return res.json({ success: true, data: await getCommunityPosts({ ...req.query, viewerId: req.user.id }) }); }
export async function createPost(req, res) { return res.status(201).json({ success: true, data: await createCommunityPost(req.user.id, req.body) }); }
export async function updatePost(req, res) { return res.json({ success: true, data: await editCommunityPost(req.user.id, req.params.postId, req.body, isAdmin(req)) }); }
export async function deletePost(req, res) { return res.json({ success: true, data: await removeCommunityPost(req.user.id, req.params.postId, isAdmin(req)) }); }
export async function likePost(req, res) { return res.json({ success: true, data: await toggleCommunityLike(req.user.id, req.params.postId, true) }); }
export async function unlikePost(req, res) { return res.json({ success: true, data: await toggleCommunityLike(req.user.id, req.params.postId, false) }); }
export async function listComments(req, res) { return res.json({ success: true, data: await getCommunityComments(req.params.postId) }); }
export async function createComment(req, res) { return res.status(201).json({ success: true, data: await addCommunityComment(req.user.id, req.params.postId, req.body) }); }
export async function deleteComment(req, res) { return res.json({ success: true, data: await removeCommunityComment(req.user.id, req.params.commentId, isAdmin(req)) }); }
export async function reportContent(req, res) { return res.status(201).json({ success: true, data: await reportCommunityContent(req.user.id, { ...req.body, postId: req.params.postId }) }); }
export async function reportComment(req, res) { return res.status(201).json({ success: true, data: await reportCommunityContent(req.user.id, { ...req.body, commentId: req.params.commentId }) }); }
export async function listReports(req, res) { return res.json({ success: true, data: await getCommunityReports() }); }
export async function moderateContent(req, res) { return res.json({ success: true, data: await moderateCommunityContent(req.user.id, req.body) }); }
