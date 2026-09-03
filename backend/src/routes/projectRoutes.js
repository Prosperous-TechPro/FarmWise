import express from 'express';
import { authenticate, authorize, requireFarmAccess, requireFarmRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { addBudgetLine, createProjectController, deleteBudgetLine, deleteProjectController, listProjects, updateBudgetLine, updateProjectController } from '../controllers/projectController.js';

const router = express.Router();
const farmWrite = [requireFarmAccess, requireFarmRole(['OWNER', 'MANAGER'])];
router.use(authenticate, authorize);
router.get('/farms/:farmId/projects', requireFarmAccess, asyncHandler(listProjects));
router.post('/farms/:farmId/projects', ...farmWrite, asyncHandler(createProjectController));
router.put('/farms/:farmId/projects/:projectId', ...farmWrite, asyncHandler(updateProjectController));
router.delete('/farms/:farmId/projects/:projectId', ...farmWrite, asyncHandler(deleteProjectController));
router.post('/farms/:farmId/projects/:projectId/budget-lines', ...farmWrite, asyncHandler(addBudgetLine));
router.put('/farms/:farmId/projects/:projectId/budget-lines/:lineId', ...farmWrite, asyncHandler(updateBudgetLine));
router.delete('/farms/:farmId/projects/:projectId/budget-lines/:lineId', ...farmWrite, asyncHandler(deleteBudgetLine));
export default router;
