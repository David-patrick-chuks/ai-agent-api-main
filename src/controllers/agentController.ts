import { NextFunction, Request, Response } from 'express';
import Agent from '../models/Agent';
import { AppError } from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import HttpStatus from '../utils/httpStatus';


// Create Agent
export const createAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body, "loggin request body")
  const { name, description, platforms, tone, website, industry, target_audience, goal,
    role} = req.body;
  console.log(req.body, "loggin request body name")
  const agent = await Agent.create({ 
    ownerId: 'default-owner', 
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

// List Agents
export const listAgents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const agents = await Agent.find({});

  res.status(HttpStatus.OK).json({
    status: 'success',
    results: agents.length,
    data: {
      agents
    }
  });
});

// Get Agent by ID
export const getAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const agent = await Agent.findOne({ agentId: req.params.agentId });
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

// Update Agent
export const updateAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const agent = await Agent.findOneAndUpdate(
    { agentId: req.params.agentId },
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

// Delete Agent
export const deleteAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const agent = await Agent.findOneAndDelete({ agentId: req.params.agentId });

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
  const { type, config } = req.body;
  const agent = await Agent.findOne({ agentId: req.params.agentId });
   
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
  const agent = await Agent.findOne({ agentId: req.params.agentId });
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