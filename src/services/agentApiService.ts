import axios from 'axios';
import FormData from 'form-data';

// const AGENT_API_BASE_URL = process.env.AGENT_API_BASE_URL || 'http://localhost:3000';
const AGENT_API_BASE_URL = 'http://localhost:3000';

console.log(AGENT_API_BASE_URL, "logging agent api base url");

export async function trainAgent(data: any) {
  console.log('Making train request without auth headers');
  
  // Check if this is a file upload (audio/video training)
  const hasFiles = data.files && data.files.length > 0;
  const isFileTraining = data.source === 'audio' || data.source === 'video';
  
  console.log('Debug - hasFiles:', hasFiles, 'isFileTraining:', isFileTraining);
  console.log('Debug - files count:', data.files?.length || 0);
  
  if (hasFiles && isFileTraining) {
    // For file uploads, create FormData
    const formData = new FormData();
    formData.append('agentId', data.agentId);
    formData.append('source', data.source);
    formData.append('fileType', data.fileType);
    
    // Add files to FormData - use 'files' field as expected by multer
    data.files.forEach((file: any, index: number) => {
      console.log(`Debug - Adding file ${index}:`, file.originalname, 'size:', file.buffer?.length);
      const buffer = Buffer.from(file.buffer);
      // Try without the options object first
      formData.append('files', buffer, file.originalname);
    });
    
    // Add other fields if present
    if (data.text) formData.append('text', data.text);
    if (data.sourceUrl) formData.append('sourceUrl', data.sourceUrl);
    if (data.sourceMetadata) formData.append('sourceMetadata', JSON.stringify(data.sourceMetadata));
    
    console.log('Debug - FormData created, sending to external API');
    console.log('Debug - FormData headers:', formData.getHeaders());
    
    return axios.post(`${AGENT_API_BASE_URL}/api/train`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
  } else {
    // For non-file requests, send as JSON
    return axios.post(`${AGENT_API_BASE_URL}/api/train`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
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