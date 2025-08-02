import express from 'express';
import {
    addDeployment,
    createAgent,
    deleteAgent,
    getAgent,
    listAgents,
    listDeployments,
    updateAgent
} from '../controllers/agentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Agent CRUD
router.use(protect)
router.post('/', createAgent);
router.get('/', listAgents);
router.get('/:agentId', getAgent);
router.put('/:agentId',  updateAgent);
router.delete('/:agentId',  deleteAgent);

// Deployment management
router.post('/:agentId/deployments',  addDeployment);
router.get('/:agentId/deployments',  listDeployments);

export default router; 