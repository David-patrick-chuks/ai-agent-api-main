import { Request, Response } from 'express';
import Agent from '../models/Agent';

// Create Agent
export async function createAgent(req: Request, res: Response) {
  try {
  const ownerId = (req.user as any).userId;
    const { name, description, platforms, tone, role, do_not_answer_from_general_knowledge } = req.body;
    const agent = await Agent.create({ 
      ownerId, 
      name, 
      description, 
      platforms, 
      tone, 
      role, 
      do_not_answer_from_general_knowledge 
    });
    res.status(201).json(agent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create agent', details: err });
  }
}

// List Agents for owner
export async function listAgents(req: Request, res: Response) {
  try {
  const ownerId = (req.user as any).userId;
    const agents = await Agent.find({ ownerId });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list agents', details: err });
  }
}

// Get Agent by ID (owner only)
export async function getAgent(req: Request, res: Response) {
  try {
  const ownerId = (req.user as any).userId;
    const agent = await Agent.findOne({ agentId: req.params.agentId, ownerId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get agent', details: err });
  }
}

// Update Agent (owner only)
export async function updateAgent(req: Request, res: Response) {
  try {
  const ownerId = (req.user as any).userId;
    const agent = await Agent.findOneAndUpdate(
      { agentId: req.params.agentId, ownerId },
      req.body,
      { new: true }
    );
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update agent', details: err });
  }
}

// Delete Agent (owner only)
export async function deleteAgent(req: Request, res: Response) {
  try {
  const ownerId = (req.user as any).userId;
    const agent = await Agent.findOneAndDelete({ agentId: req.params.agentId, ownerId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete agent', details: err });
  }
}

// Add Deployment to Agent
export async function addDeployment(req: Request, res: Response) {
  try {
  const ownerId = (req.user as any).userId;
    const { type, config } = req.body;
    const agent = await Agent.findOne({ agentId: req.params.agentId, ownerId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    agent.deployments.push({ type, config, status: 'active', deployedAt: new Date() });
    await agent.save();
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add deployment', details: err });
  }
}

// List Deployments for Agent
export async function listDeployments(req: Request, res: Response) {
  try {
  const ownerId = (req.user as any).userId;
    const agent = await Agent.findOne({ agentId: req.params.agentId, ownerId });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent.deployments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list deployments', details: err });
  }
} 