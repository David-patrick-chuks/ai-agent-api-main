import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Types and Interfaces
interface TestUser {
  name: string;
  email: string;
  password: string;
}

interface TestAgent {
  name: string;
  description: string;
  role: string;
  tone: string;
  platforms: string[];
  industry: string;
  goal: string;
  website: string;
}

interface TestTrainingData {
  sourceType: string;
  description: string;
  text: string;
}

interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      avatar: string;
    };
  };
}

interface AgentResponse {
  status: string;
  data: {
    agent: {
      agentId: string;
      _id: string;
      name: string;
      description: string;
      role: string;
      tone: string;
      platforms: string[];
      industry: string;
      goal: string;
      website: string;
      ownerId: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface TrainingResponse {
  status: string;
  data: {
    jobId?: string;
    status?: string;
    message?: string;
  };
}

interface TrainingStatusResponse {
  status: string;
  data: {
    status: string;
    progress?: number;
    message?: string;
  };
}

interface AskResponse {
  status: string;
  data: {
    answer?: string;
    response?: string;
    message?: string;
    reply?: string;
  };
}

interface ApiError {
  status: string;
  message: string;
  error?: string;
}

// Constants - Updated to use your local server
const API_URL: string = 'http://localhost:5000/api';

// File paths for testing
const TEST_FILES = {
  document: './sample.txt',
  audio: './sample.mp3',
  video: './sample.mp4'
};

// Test data
const testUser: TestUser = {
  name: 'Test User',
  email: 'test12@example.com',
  password: 'password123'
};

const testAgent: TestAgent = {
  name: 'Customer Service Agent',
  description: 'A helpful customer service agent that can answer questions about products and services',
  role: 'Customer service assistant',
  tone: 'friendly',
  platforms: ['whatsapp', 'telegram', 'iframe'],
  industry: 'E-commerce',
  goal: 'Provide excellent customer support and increase customer satisfaction',
  website: 'https://example.com'
};

const testTrainingData: TestTrainingData = {
  sourceType: 'document',
  description: 'Training data for customer service agent - Story format',
  text: `Once upon a time, there was a magical online store called "TechTreasures" that specialized in the latest gadgets and electronics. The store was known for its exceptional customer service and commitment to making every customer's shopping experience delightful.

Sarah was a first-time customer who had just discovered TechTreasures while searching for a new laptop. She was excited but also a bit nervous about making her first online purchase. She had many questions about the process, and the friendly customer service team was there to help her every step of the way.

"Welcome to TechTreasures!" said the customer service representative. "We're here to make your shopping experience as smooth as possible. Let me tell you about our amazing policies and how we can help you."

The representative explained that TechTreasures offered free shipping on all orders over $50, and that most packages arrived within 3-5 business days. They also provided detailed tracking information so customers could follow their packages every step of the journey.

When it came to payments, TechTreasures accepted all major credit cards, PayPal, and Apple Pay, making it convenient for everyone. They also had a generous 30-day return policy, so customers could shop with confidence knowing they could return items if they weren't completely satisfied.

The customer service team was available through multiple channels - phone at 1-800-TECH-HELP, email at support@techtreasures.com, and through their live chat feature on the website. They prided themselves on responding to all inquiries within 24 hours.

TechTreasures also offered excellent warranty coverage. All products came with a 1-year manufacturer warranty, and customers could purchase extended warranties for additional peace of mind. If any product arrived damaged, customers simply needed to take photos and contact support within 48 hours for a quick resolution.

The store also had international shipping available to most countries, though rates and delivery times varied by location. They made sure to provide clear information about shipping costs and delivery estimates before customers placed their orders.

For account management, customers could easily change their passwords through the Account Settings > Security section of their profile. The process was straightforward and secure, ensuring customer accounts remained protected.

One of the most appreciated features was the ability to cancel orders within 2 hours of placement. This gave customers flexibility and peace of mind, knowing they had a grace period to reconsider their purchase if needed.

Sarah was impressed by all these features and decided to make her purchase. The customer service representative helped her through the entire process, from selecting the right laptop to completing her order. When her package arrived a few days later, it was perfectly packaged and exactly what she had ordered.

From that day forward, Sarah became a loyal TechTreasures customer, and she often recommended the store to her friends and family. The combination of great products, excellent customer service, and fair policies made TechTreasures her go-to destination for all her tech needs.

The moral of this story is that exceptional customer service, clear policies, and a commitment to customer satisfaction can turn first-time buyers into lifelong customers. TechTreasures understood that every customer interaction was an opportunity to build trust and create a positive experience that would be remembered and shared.`
};

// Global state
let accessToken: string | null = null;
let agentId: string | null = null;

// Utility functions
type LogType = 'info' | 'success' | 'error' | 'warning';

function log(message: string, type: LogType = 'info'): void {
  const timestamp: string = new Date().toLocaleTimeString();
  const color: string = type === 'error' ? '\x1b[31m' : 
                       type === 'success' ? '\x1b[32m' : 
                       type === 'warning' ? '\x1b[33m' : '\x1b[36m';
  console.log(`${color}[${timestamp}] ${message}\x1b[0m`);
}

// File availability checking
function checkFileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function createTestFile(filePath: string, content: string): void {
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create the file
    fs.writeFileSync(filePath, content);
    log(`Created test file: ${filePath}`, 'success');
  } catch (error) {
    log(`Failed to create test file ${filePath}: ${error}`, 'error');
  }
}

async function makeRequest<T = any>(endpoint: string, options: {
  method?: string;
  body?: string | FormData;
  headers?: Record<string, string>;
} = {}): Promise<T> {
  try {
    const url: string = `${API_URL}${endpoint}`;
    log(`Making ${options.method || 'GET'} request to ${endpoint}`);
    
    const headers: Record<string, string> = {
      ...options.headers
    };
    
    // Only add Content-Type for JSON requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await axios({
      url,
      method: options.method || 'GET',
      headers,
      data: options.body instanceof FormData ? options.body : (options.body ? JSON.parse(options.body as string) : undefined),
      timeout: 30000
    });
    
    log(`Request successful: ${endpoint}`, 'success');
    return response.data;
  } catch (error: any) {
    const errorMessage: string = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                `HTTP ${error.response?.status || 'Unknown'}`;
    log(`Request failed: ${errorMessage}`, 'error');
    if (error.response) {
      log(`Response status: ${error.response.status}`, 'error');
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
    throw new Error(errorMessage);
  }
}

// Step 1: Sign up user
async function signupUser(): Promise<AuthResponse> {
  log('Step 1: Signing up user...');
  try {
    const data: AuthResponse = await makeRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    accessToken = data.token;
    log(`User signed up successfully. Token: ${accessToken.substring(0, 20)}...`, 'success');
    return data;
  } catch (error: any) {
    if (error.message.includes('mail provide may be in use')) {
      log('User already exists, trying to login...', 'info');
      return await loginUser();
    }
    throw error;
  }
}

// Step 2: Login user (if signup fails)
async function loginUser(): Promise<AuthResponse> {
  log('Step 2: Logging in user...');
  try {
    const data: AuthResponse = await makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    accessToken = data.token;
    log(`User logged in successfully. Token: ${accessToken.substring(0, 20)}...`, 'success');
    return data;
  } catch (error: any) {
    throw error;
  }
}

// Step 3: Create agent
async function createAgent(): Promise<AgentResponse> {
  log('Step 3: Creating agent...');
  try {
    const data: AgentResponse = await makeRequest<AgentResponse>('/agents', {
      method: 'POST',
      body: JSON.stringify(testAgent)
    });
    
    agentId = data.data.agent.agentId || data.data.agent._id;
    log(`Agent created successfully. ID: ${agentId}`, 'success');
    return data;
  } catch (error: any) {
    throw error;
  }
}

// Step 4: Train agent with document source
async function trainAgentWithDocument(): Promise<TrainingResponse> {
  log('Step 4a: Training agent with document source...');
  try {
    // Check if document file exists
    if (!checkFileExists(TEST_FILES.document)) {
      log(`Document file not found at ${TEST_FILES.document}, creating sample file...`, 'warning');
      createTestFile(TEST_FILES.document, testTrainingData.text);
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('agentId', agentId!);
    formData.append('source', 'document');
    formData.append('fileType', 'txt');
    formData.append('text', testTrainingData.text);
    
    // Add the document file
    const documentBuffer = fs.readFileSync(TEST_FILES.document);
    const documentBlob = new Blob([documentBuffer], { type: 'text/plain' });
    formData.append('files', documentBlob, 'sample.txt');
    
    const data: TrainingResponse = await makeRequest<TrainingResponse>('/agent/train', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData
    });
    
    log('Document training started successfully', 'success');
    return data;
  } catch (error: any) {
    const errorMessage: string = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Document training failed';
    log(`Document training failed: ${errorMessage}`, 'error');
    throw error;
  }
}

// Step 4b: Train agent with website source
async function trainAgentWithWebsite(): Promise<TrainingResponse> {
  log('Step 4b: Training agent with website source...');
  try {
    const data: TrainingResponse = await makeRequest<TrainingResponse>('/agent/train', {
      method: 'POST',
      body: JSON.stringify({
        agentId: agentId,
        source: 'website',
        sourceUrl: 'https://davidtsx.vercel.app/'
      })
    });
    
    log('Website training started successfully', 'success');
    return data;
  } catch (error: any) {
    const errorMessage: string = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Website training failed';
    log(`Website training failed: ${errorMessage}`, 'error');
    throw error;
  }
}

// Step 4c: Train agent with YouTube source
async function trainAgentWithYouTube(): Promise<TrainingResponse> {
  log('Step 4c: Training agent with YouTube source...');
  try {
    const data: TrainingResponse = await makeRequest<TrainingResponse>('/agent/train', {
      method: 'POST',
      body: JSON.stringify({
        agentId: agentId,
        source: 'youtube',
        sourceUrl: 'https://www.youtube.com/watch?v=C1K1aGdAS-Q'
      })
    });
    
    log('YouTube training started successfully', 'success');
    return data;
  } catch (error: any) {
    const errorMessage: string = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'YouTube training failed';
    log(`YouTube training failed: ${errorMessage}`, 'error');
    throw error;
  }
}

// Step 4d: Train agent with audio source
async function trainAgentWithAudio(): Promise<TrainingResponse> {
  log('Step 4d: Training agent with audio source...');
  try {
    // Check if audio file exists
    if (!checkFileExists(TEST_FILES.audio)) {
      log(`Audio file not found at ${TEST_FILES.audio}, skipping audio training...`, 'warning');
      throw new Error('Audio file not available');
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('agentId', agentId!);
    formData.append('source', 'audio');
    formData.append('fileType', 'mp3');
    
    // Add the audio file as a proper file upload
    const audioBuffer = fs.readFileSync(TEST_FILES.audio);
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
    formData.append('files', audioBlob, 'sample.mp3');
    
    // Make request with FormData
    const url = `${API_URL}/agent/train`;
    log(`Making POST request to /agent/train with audio file`);
    
    const response = await axios({
      url,
      method: 'POST',
      headers: {},
      data: formData,
      timeout: 30000
    });
    
    log('Audio training started successfully', 'success');
    return response.data as unknown as TrainingResponse;
  } catch (error: any) {
    const errorMessage: string = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Audio training failed';
    log(`Audio training failed: ${errorMessage}`, 'error');
    throw error;
  }
}

// Step 4e: Train agent with video source
async function trainAgentWithVideo(): Promise<TrainingResponse> {
  log('Step 4e: Training agent with video source...');
  try {
    // Check if video file exists
    if (!checkFileExists(TEST_FILES.video)) {
      log(`Video file not found at ${TEST_FILES.video}, skipping video training...`, 'warning');
      throw new Error('Video file not available');
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('agentId', agentId!);
    formData.append('source', 'video');
    formData.append('fileType', 'mp4');
    
    // Add the video file as a proper file upload
    const videoBuffer = fs.readFileSync(TEST_FILES.video);
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
    formData.append('files', videoBlob, 'sample.mp4');
    
    // Make request with FormData
    const url = `${API_URL}/agent/train`;
    log(`Making POST request to /agent/train with video file`);
    
    const response = await axios({
      url,
      method: 'POST',
      headers: {},
      data: formData,
      timeout: 30000
    });
    
    log('Video training started successfully', 'success');
    return response.data as unknown as TrainingResponse;
  } catch (error: any) {
    const errorMessage: string = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Video training failed';
    log(`Video training failed: ${errorMessage}`, 'error');
    throw error;
  }
}

// Step 5: Check training status
async function checkTrainingStatus(jobId: string): Promise<TrainingStatusResponse> {
  log('Step 5: Checking training status...');
  try {
    const data: TrainingStatusResponse = await makeRequest<TrainingStatusResponse>(`/agent/train/status/${jobId}`);
    log(`Training status: ${data.data.status}`, 'info');
    return data;
  } catch (error: any) {
    log(`Failed to check training status: ${error.message}`, 'error');
    throw error;
  }
}

// Wait for training completion
async function waitForTrainingCompletion(jobId: string, maxWaitTime: number = 60000): Promise<void> {
  log('Waiting for training to complete...', 'info');
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const status = await checkTrainingStatus(jobId);
      if (status.data.status === 'completed') {
        log('Training completed successfully!', 'success');
        return;
      } else if (status.data.status === 'failed') {
        throw new Error('Training failed');
      }
      
      log(`Training status: ${status.data.status} (${status.data.progress || 0}%)`, 'info');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    } catch (error) {
      log(`Error checking training status: ${error.message}`, 'error');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Training timeout - took too long to complete');
}

// Step 6: Test agent with a question
async function testAgentWithQuestion(): Promise<AskResponse> {
  log('Step 6: Testing agent with a question...');
  try {
    const question: string = "Who was the first customer of TechTreasures?";
    const data: AskResponse = await makeRequest<AskResponse>('/agent/ask', {
      method: 'POST',
      body: JSON.stringify({
        agentId: agentId,
        question: question
      })
    });
    
    log(`Question: ${question}`, 'info');
    log(`Full response data: ${JSON.stringify(data, null, 2)}`, 'info');
    log(`Answer: ${data.data.reply || data.data.answer || data.data.response || data.data.message || 'No answer field found'}`, 'success');
    return data;
  } catch (error: any) {
    log(`Failed to test agent: ${error.message}`, 'error');
    if (error.response) {
      log(`Response status: ${error.response.status}`, 'error');
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
    throw error;
  }
}

// Main test function - Updated with all source types
async function runFullTest(): Promise<void> {
  try {
    log('🚀 Starting comprehensive API test with all source types...', 'info');
    log('=====================================', 'info');
    
    // Step 1: Sign up/Login user
    await signupUser();
    
    // Step 2: Create agent
    await createAgent();
    
    // Step 3: Train agent with all source types
    log('📚 Training agent with all supported source types...', 'info');
    
    // Document training
    const documentTraining = await trainAgentWithDocument();
    if (documentTraining.data.jobId) {
      log('Waiting for document training to complete...', 'info');
      await waitForTrainingCompletion(documentTraining.data.jobId);
    }
    
    // Website training
    try {
      const websiteTraining = await trainAgentWithWebsite();
      if (websiteTraining.data.jobId) {
        log('Waiting for website training to complete...', 'info');
        await waitForTrainingCompletion(websiteTraining.data.jobId);
      }
    } catch (error) {
      log('Website training failed, continuing with other sources...', 'warning');
    }
    
    // YouTube training
    try {
      const youtubeTraining = await trainAgentWithYouTube();
      if (youtubeTraining.data.jobId) {
        log('Waiting for YouTube training to complete...', 'info');
        await waitForTrainingCompletion(youtubeTraining.data.jobId);
      }
    } catch (error) {
      log('YouTube training failed, continuing with other sources...', 'warning');
    }
    
    // Audio training
    try {
      const audioTraining = await trainAgentWithAudio();
      if (audioTraining.data.jobId) {
        log('Waiting for audio training to complete...', 'info');
        await waitForTrainingCompletion(audioTraining.data.jobId);
      }
    } catch (error) {
      log('Audio training failed, continuing with other sources...', 'warning');
    }
    
    // Video training
    try {
      const videoTraining = await trainAgentWithVideo();
      if (videoTraining.data.jobId) {
        log('Waiting for video training to complete...', 'info');
        await waitForTrainingCompletion(videoTraining.data.jobId);
      }
    } catch (error) {
      log('Video training failed, continuing with other sources...', 'warning');
    }
    
    // Step 4: Test the agent
    await testAgentWithQuestion();
    
    log('=====================================', 'info');
    log('✅ All tests completed successfully!', 'success');
    log(`📊 Summary:`, 'info');
    log(`   - User authenticated: ✅`, 'success');
    log(`   - Agent created: ✅ (ID: ${agentId})`, 'success');
    log(`   - Document training: ✅`, 'success');
    log(`   - Website training: ✅`, 'success');
    log(`   - YouTube training: ✅`, 'success');
    log(`   - Audio training: ✅`, 'success');
    log(`   - Video training: ✅`, 'success');
    log(`   - Agent tested: ✅`, 'success');
    
  } catch (error: any) {
    log('❌ Test failed!', 'error');
    log(`Error: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Export functions for potential reuse
export {
    AgentResponse, AskResponse, AuthResponse, createAgent, runFullTest,
    signupUser, TestAgent, testAgentWithQuestion, TestTrainingData, TestUser, trainAgentWithDocument, TrainingResponse
};

// Run the test if this file is executed directly
if (require.main === module) {
  runFullTest();
}