import { Request, Response, NextFunction } from 'express';
import Agent from '../models/Agent';
import catchAsync from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import  HttpStatus  from '../utils/httpStatus';
import { IUserDoc } from '../models/User';


// Create Agent
export const createAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.userId;
  console.log(req.user, "loggin current user")
  if (!ownerId) {
    return next(new AppError('User not authenticated', HttpStatus.UNAUTHORIZED));
  }
console.log(req.body, "loggin request body")
  const { name, description, platforms, tone, website, industry, target_audience, goal,
    role} = req.body;
  console.log(req.body, "loggin request body name")
  const agent = await Agent.create({ 
    ownerId, 
    name, 
    description, 
    platforms, 
    tone, 
    website,
    industry,
    target_audience,
    goal,
    role
  });

  res.status(HttpStatus.CREATED).json({
    status: 'success',
    data: {
      agent
    }
  });
});

// List Agents for owner
export const listAgents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return next(new AppError('User not authenticated', HttpStatus.UNAUTHORIZED));
  }

  const agents = await Agent.find({ ownerId });

  res.status(HttpStatus.OK).json({
    status: 'success',
    results: agents.length,
    data: {
      agents
    }
  });
});

// Get Agent by ID (owner only)
export const getAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return next(new AppError('User not authenticated', HttpStatus.UNAUTHORIZED));
  }

  const agent = await Agent.findOne({ agentId: req.params.agentId, ownerId });
  if (!agent) {
    return next(new AppError('Agent not found', HttpStatus.NOT_FOUND));
  }

  res.status(HttpStatus.OK).json({
    status: 'success',
    data: {
      agent
    }
  });
});

// Update Agent (owner only)
export const updateAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return next(new AppError('User not authenticated', HttpStatus.UNAUTHORIZED));
  }

  const agent = await Agent.findOneAndUpdate(
    { agentId: req.params.agentId, ownerId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!agent) {
    return next(new AppError('Agent not found', HttpStatus.NOT_FOUND));
  }

  res.status(HttpStatus.OK).json({
    status: 'success',
    data: {
      agent
    }
  });
});

// Delete Agent (owner only)
export const deleteAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return next(new AppError('User not authenticated', HttpStatus.UNAUTHORIZED));
  }

  const agent = await Agent.findOneAndDelete({ agentId: req.params.agentId, ownerId });
  if (!agent) {
    return next(new AppError('Agent not found', HttpStatus.NOT_FOUND));
  }

  res.status(HttpStatus.NO_CONTENT).json({
    status: 'success',
    data: null
  });
});

// Add Deployment to Agent
export const addDeployment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return next(new AppError('User not authenticated', HttpStatus.UNAUTHORIZED));
  }

  const { type, config } = req.body;
  const agent = await Agent.findOne({ agentId: req.params.agentId, ownerId });
  
  if (!agent) {
    return next(new AppError('Agent not found', HttpStatus.NOT_FOUND));
  }

  agent.deployments.push({
    type,
    config,
    status: 'active',
    deployedAt: new Date()
  });
  
  await agent.save();

  res.status(HttpStatus.CREATED).json({
    status: 'success',
    data: {
      agent
    }
  });
});

// List Deployments for Agent
export const listDeployments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.userId;
  if (!ownerId) {
    return next(new AppError('User not authenticated', HttpStatus.UNAUTHORIZED));
  }

  const agent = await Agent.findOne({ agentId: req.params.agentId, ownerId });
  if (!agent) {
    return next(new AppError('Agent not found', HttpStatus.NOT_FOUND));
  }

  res.status(HttpStatus.OK).json({
    status: 'success',
    results: agent.deployments.length,
    data: {
      deployments: agent.deployments
    }
  });
}); 