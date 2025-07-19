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
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

// Agent CRUD
router.post('/', authenticateJWT, createAgent);
router.get('/', authenticateJWT, listAgents);
router.get('/:agentId', authenticateJWT, getAgent);
router.put('/:agentId', authenticateJWT, updateAgent);
router.delete('/:agentId', authenticateJWT, deleteAgent);

// Deployment management
router.post('/:agentId/deployments', authenticateJWT, addDeployment);
router.get('/:agentId/deployments', authenticateJWT, listDeployments);

export default router; 