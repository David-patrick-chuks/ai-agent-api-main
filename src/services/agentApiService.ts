import axios from 'axios';

// const AGENT_API_BASE_URL = process.env.AGENT_API_BASE_URL || 'http://localhost:3000';
const AGENT_API_BASE_URL = 'http://localhost:3000';

console.log(AGENT_API_BASE_URL, "logging agent api base url");

export async function trainAgent(data: any) {
  console.log('Making train request without auth headers');
  
  return axios.post(`${AGENT_API_BASE_URL}/api/train`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function getTrainingStatus(jobId: string) {
  console.log('Making status request without auth headers');
  
  return axios.get(`${AGENT_API_BASE_URL}/api/train/status/${jobId}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function askAgent(data: any) {
  console.log('Making ask request without auth headers');
  
  return axios.post(`${AGENT_API_BASE_URL}/api/ask`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}