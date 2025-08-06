# AI Agent API Test Suite

A comprehensive TypeScript test suite for testing the AI Agent API with all supported training source types.

## Overview

This test suite automates the complete workflow of the AI Agent API, including user authentication, agent creation, training with multiple source types, and agent testing. It's designed to validate the full functionality of the API in a single run.

## Features

- **Complete API Testing**: Tests all major API endpoints in sequence
- **Multiple Training Sources**: Supports document, website, YouTube, audio, and video training
- **File Handling**: Automatically creates test files and handles file uploads
- **Error Handling**: Comprehensive error logging and graceful failure handling
- **Progress Tracking**: Real-time status updates and progress monitoring
- **Authentication**: Handles user signup, login, and token management

## Prerequisites

- Node.js (v14 or higher)
- TypeScript
- The AI Agent API server running on `localhost:5000`
- The external Agent API server running on `localhost:3000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install TypeScript and tsx for running TypeScript files:
```bash
npm install -g typescript tsx
```

## Test Files

The test suite uses the following files for training:

- `sample.txt` - Document training (auto-created if missing)
- `sample.mp3` - Audio training (must exist)
- `sample.mp4` - Video training (must exist)

## Usage

### Running the Complete Test Suite

```bash
node -r tsx/cjs test-api.ts
```

### Test Flow

The test suite follows this sequence:

1. **User Authentication**
   - Attempts to sign up a new user
   - Falls back to login if user already exists
   - Stores authentication token

2. **Agent Creation**
   - Creates a new AI agent with predefined configuration
   - Stores agent ID for subsequent operations

3. **Training with Multiple Sources**
   - **Document Training**: Uses text content from `sample.txt`
   - **Website Training**: Scrapes content from a test website
   - **YouTube Training**: Processes a YouTube video transcript
   - **Audio Training**: Transcribes audio from `sample.mp3`
   - **Video Training**: Transcribes video from `sample.mp4`

4. **Agent Testing**
   - Sends a test question to the trained agent
   - Validates the response

## Configuration

### Test Data

The test suite uses predefined test data:

```typescript
const testUser = {
  name: 'Test User',
  email: 'test12@example.com',
  password: 'password123'
};

const testAgent = {
  name: 'Customer Service Agent',
  description: 'A helpful customer service agent...',
  role: 'Customer service assistant',
  tone: 'friendly',
  platforms: ['whatsapp', 'telegram', 'iframe'],
  industry: 'E-commerce',
  goal: 'Provide excellent customer support...',
  website: 'https://example.com'
};
```

### Training Content

The document training uses a story about "TechTreasures" - a fictional online store that demonstrates customer service scenarios.

### API Endpoints

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: `/auth/signup`, `/auth/login`
- **Agents**: `/agents`
- **Training**: `/agent/train`
- **Status**: `/agent/train/status/:jobId`
- **Asking**: `/agent/ask`

## Supported Training Sources

### 1. Document Training
- **Source**: Text content from files or direct text input
- **File Types**: TXT, PDF, DOCX, etc.
- **Test File**: `sample.txt` (auto-created)

### 2. Website Training
- **Source**: Web scraping
- **URL**: `https://davidtsx.vercel.app/`
- **Process**: Scrapes all content from the website

### 3. YouTube Training
- **Source**: YouTube video transcript
- **URL**: `https://www.youtube.com/watch?v=C1K1aGdAS-Q`
- **Process**: Fetches transcript or generates summary

### 4. Audio Training
- **Source**: Audio file transcription
- **File**: `sample.mp3`
- **Process**: Uses AI to transcribe audio content

### 5. Video Training
- **Source**: Video file transcription
- **File**: `sample.mp4`
- **Process**: Extracts audio and transcribes content

## Error Handling

The test suite includes comprehensive error handling:

- **Graceful Failures**: Individual training sources can fail without stopping the entire test
- **Detailed Logging**: Color-coded log messages for different severity levels
- **Error Details**: Full error information including status codes and response data
- **Timeout Protection**: Prevents infinite waiting with configurable timeouts

## Logging

The test suite provides detailed logging with color coding:

- 🔵 **Info**: General information and progress updates
- 🟢 **Success**: Successful operations
- 🟡 **Warning**: Non-critical issues or fallbacks
- 🔴 **Error**: Failures and errors

## File Management

### Automatic File Creation

The test suite automatically creates missing test files:

```typescript
function createTestFile(filePath: string, content: string): void {
  // Creates directory if needed
  // Writes content to file
  // Logs success/failure
}
```

### File Validation

Before using files, the suite validates their existence:

```typescript
function checkFileExists(filePath: string): boolean {
  // Checks if file exists
  // Returns false if file is missing or inaccessible
}
```

## API Response Types

The test suite defines comprehensive TypeScript interfaces for all API responses:

```typescript
interface TrainingResponse {
  status: string;
  data: {
    jobId?: string;
    status?: string;
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
```

## Troubleshooting

### Common Issues

1. **Server Not Running**
   - Ensure the main API server is running on port 5000
   - Ensure the external Agent API server is running on port 3000

2. **Missing Files**
   - Audio and video files (`sample.mp3`, `sample.mp4`) must exist
   - Document file (`sample.txt`) will be auto-created

3. **Authentication Errors**
   - Check if the user already exists
   - Verify JWT secret is configured

4. **Training Failures**
   - Check external API logs for detailed error information
   - Verify file formats are supported
   - Check network connectivity to external services

### Debug Mode

The test suite includes extensive debugging output:

- Request/response logging
- File processing details
- Training progress updates
- Error stack traces

## Customization

### Modifying Test Data

To test with different data, modify the constants at the top of the file:

```typescript
const testUser = {
  name: 'Your Test User',
  email: 'your-email@example.com',
  password: 'your-password'
};

const testAgent = {
  name: 'Your Custom Agent',
  // ... other properties
};
```

### Adding New Training Sources

To add new training sources, create new functions following the existing pattern:

```typescript
async function trainAgentWithNewSource(): Promise<TrainingResponse> {
  // Implementation
}
```

### Changing Test Files

Modify the `TEST_FILES` constant:

```typescript
const TEST_FILES = {
  document: './your-document.txt',
  audio: './your-audio.mp3',
  video: './your-video.mp4'
};
```

## Performance

- **Timeout**: 30 seconds per request
- **Training Wait**: 60 seconds maximum wait time
- **File Size**: Supports large files (tested with 8MB+ audio files)
- **Concurrent Operations**: Sequential processing for reliability

## Security

- **Token Management**: Secure storage and transmission of JWT tokens
- **File Validation**: Checks file existence and accessibility
- **Error Sanitization**: Prevents sensitive information leakage in logs

## Contributing

When modifying the test suite:

1. Maintain the existing error handling patterns
2. Add appropriate logging for new features
3. Update this README for any new functionality
4. Test with different file types and sizes
5. Ensure backward compatibility

## License

This test suite is part of the AI Agent API project and follows the same license terms. 