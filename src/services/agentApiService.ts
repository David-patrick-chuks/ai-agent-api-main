import axios from 'axios';

const AGENT_API_BASE_URL = process.env.AGENT_API_BASE_URL || 'http://localhost:3000';
const AGENT_API_TOKEN = process.env.AGENT_API_TOKEN || '';

const authHeader = AGENT_API_TOKEN ? { Authorization: `Bearer ${AGENT_API_TOKEN}` } : undefined;

export async function trainAgent(data: any) {
  return axios.post(`${AGENT_API_BASE_URL}/api/train`, data, {
    headers: authHeader
  });
}

export async function getTrainingStatus(jobId: string) {
  return axios.get(`${AGENT_API_BASE_URL}/api/train/status/${jobId}`, {
    headers: authHeader
  });
}

export async function askAgent(data: any) {
  return axios.post(`${AGENT_API_BASE_URL}/api/ask`, data, {
    headers: authHeader
  });
} 