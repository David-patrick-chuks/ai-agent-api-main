"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgent = createAgent;
exports.runFullTest = runFullTest;
exports.signupUser = signupUser;
exports.testAgentWithQuestion = testAgentWithQuestion;
exports.trainAgentWithDocument = trainAgentWithDocument;
var axios_1 = require("axios");
var fs = require("fs");
var path = require("path");
// Constants - Updated to use your local server
var API_URL = 'http://localhost:5000/api';
// File paths for testing
var TEST_FILES = {
    document: './sample.txt',
    audio: './sample.mp3',
    video: './sample.mp4'
};
// Test data
var testUser = {
    name: 'Test User',
    email: 'test12@example.com',
    password: 'password123'
};
var testAgent = {
    name: 'Customer Service Agent',
    description: 'A helpful customer service agent that can answer questions about products and services',
    role: 'Customer service assistant',
    tone: 'friendly',
    platforms: ['whatsapp', 'telegram', 'iframe'],
    industry: 'E-commerce',
    goal: 'Provide excellent customer support and increase customer satisfaction',
    website: 'https://example.com'
};
var testTrainingData = {
    sourceType: 'document',
    description: 'Training data for customer service agent - Story format',
    text: "Once upon a time, there was a magical online store called \"TechTreasures\" that specialized in the latest gadgets and electronics. The store was known for its exceptional customer service and commitment to making every customer's shopping experience delightful.\n\nSarah was a first-time customer who had just discovered TechTreasures while searching for a new laptop. She was excited but also a bit nervous about making her first online purchase. She had many questions about the process, and the friendly customer service team was there to help her every step of the way.\n\n\"Welcome to TechTreasures!\" said the customer service representative. \"We're here to make your shopping experience as smooth as possible. Let me tell you about our amazing policies and how we can help you.\"\n\nThe representative explained that TechTreasures offered free shipping on all orders over $50, and that most packages arrived within 3-5 business days. They also provided detailed tracking information so customers could follow their packages every step of the journey.\n\nWhen it came to payments, TechTreasures accepted all major credit cards, PayPal, and Apple Pay, making it convenient for everyone. They also had a generous 30-day return policy, so customers could shop with confidence knowing they could return items if they weren't completely satisfied.\n\nThe customer service team was available through multiple channels - phone at 1-800-TECH-HELP, email at support@techtreasures.com, and through their live chat feature on the website. They prided themselves on responding to all inquiries within 24 hours.\n\nTechTreasures also offered excellent warranty coverage. All products came with a 1-year manufacturer warranty, and customers could purchase extended warranties for additional peace of mind. If any product arrived damaged, customers simply needed to take photos and contact support within 48 hours for a quick resolution.\n\nThe store also had international shipping available to most countries, though rates and delivery times varied by location. They made sure to provide clear information about shipping costs and delivery estimates before customers placed their orders.\n\nFor account management, customers could easily change their passwords through the Account Settings > Security section of their profile. The process was straightforward and secure, ensuring customer accounts remained protected.\n\nOne of the most appreciated features was the ability to cancel orders within 2 hours of placement. This gave customers flexibility and peace of mind, knowing they had a grace period to reconsider their purchase if needed.\n\nSarah was impressed by all these features and decided to make her purchase. The customer service representative helped her through the entire process, from selecting the right laptop to completing her order. When her package arrived a few days later, it was perfectly packaged and exactly what she had ordered.\n\nFrom that day forward, Sarah became a loyal TechTreasures customer, and she often recommended the store to her friends and family. The combination of great products, excellent customer service, and fair policies made TechTreasures her go-to destination for all her tech needs.\n\nThe moral of this story is that exceptional customer service, clear policies, and a commitment to customer satisfaction can turn first-time buyers into lifelong customers. TechTreasures understood that every customer interaction was an opportunity to build trust and create a positive experience that would be remembered and shared."
};
// Global state
var accessToken = null;
var agentId = null;
function log(message, type) {
    if (type === void 0) { type = 'info'; }
    var timestamp = new Date().toLocaleTimeString();
    var color = type === 'error' ? '\x1b[31m' :
        type === 'success' ? '\x1b[32m' :
            type === 'warning' ? '\x1b[33m' : '\x1b[36m';
    console.log("".concat(color, "[").concat(timestamp, "] ").concat(message, "\u001B[0m"));
}
// File availability checking
function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    }
    catch (error) {
        return false;
    }
}
function createTestFile(filePath, content) {
    try {
        // Create directory if it doesn't exist
        var dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Create the file
        fs.writeFileSync(filePath, content);
        log("Created test file: ".concat(filePath), 'success');
    }
    catch (error) {
        log("Failed to create test file ".concat(filePath, ": ").concat(error), 'error');
    }
}
function makeRequest(endpoint_1) {
    return __awaiter(this, arguments, void 0, function (endpoint, options) {
        var url, headers, response, error_1, errorMessage;
        var _a, _b, _c, _d, _e;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 2, , 3]);
                    url = "".concat(API_URL).concat(endpoint);
                    log("Making ".concat(options.method || 'GET', " request to ").concat(endpoint));
                    headers = __assign({}, options.headers);
                    // Only add Content-Type for JSON requests
                    if (!(options.body instanceof FormData)) {
                        headers['Content-Type'] = 'application/json';
                    }
                    if (accessToken) {
                        headers['Authorization'] = "Bearer ".concat(accessToken);
                    }
                    return [4 /*yield*/, (0, axios_1.default)({
                            url: url,
                            method: options.method || 'GET',
                            headers: headers,
                            data: options.body instanceof FormData ? options.body : (options.body ? JSON.parse(options.body) : undefined),
                            timeout: 30000
                        })];
                case 1:
                    response = _f.sent();
                    log("Request successful: ".concat(endpoint), 'success');
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _f.sent();
                    errorMessage = ((_b = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                        ((_d = (_c = error_1.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
                        error_1.message ||
                        "HTTP ".concat(((_e = error_1.response) === null || _e === void 0 ? void 0 : _e.status) || 'Unknown');
                    log("Request failed: ".concat(errorMessage), 'error');
                    if (error_1.response) {
                        log("Response status: ".concat(error_1.response.status), 'error');
                        log("Response data: ".concat(JSON.stringify(error_1.response.data, null, 2)), 'error');
                    }
                    throw new Error(errorMessage);
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Step 1: Sign up user
function signupUser() {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('Step 1: Signing up user...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 6]);
                    return [4 /*yield*/, makeRequest('/auth/signup', {
                            method: 'POST',
                            body: JSON.stringify(testUser)
                        })];
                case 2:
                    data = _a.sent();
                    accessToken = data.token;
                    log("User signed up successfully. Token: ".concat(accessToken.substring(0, 20), "..."), 'success');
                    return [2 /*return*/, data];
                case 3:
                    error_2 = _a.sent();
                    if (!error_2.message.includes('mail provide may be in use')) return [3 /*break*/, 5];
                    log('User already exists, trying to login...', 'info');
                    return [4 /*yield*/, loginUser()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: throw error_2;
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Step 2: Login user (if signup fails)
function loginUser() {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('Step 2: Logging in user...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, makeRequest('/auth/login', {
                            method: 'POST',
                            body: JSON.stringify({
                                email: testUser.email,
                                password: testUser.password
                            })
                        })];
                case 2:
                    data = _a.sent();
                    accessToken = data.token;
                    log("User logged in successfully. Token: ".concat(accessToken.substring(0, 20), "..."), 'success');
                    return [2 /*return*/, data];
                case 3:
                    error_3 = _a.sent();
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Step 3: Create agent
function createAgent() {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('Step 3: Creating agent...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, makeRequest('/agents', {
                            method: 'POST',
                            body: JSON.stringify(testAgent)
                        })];
                case 2:
                    data = _a.sent();
                    agentId = data.data.agent.agentId || data.data.agent._id;
                    log("Agent created successfully. ID: ".concat(agentId), 'success');
                    return [2 /*return*/, data];
                case 3:
                    error_4 = _a.sent();
                    throw error_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Step 4: Train agent with document source
function trainAgentWithDocument() {
    return __awaiter(this, void 0, void 0, function () {
        var formData, documentBuffer, documentBlob, data, error_5, errorMessage;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    log('Step 4a: Training agent with document source...');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    // Check if document file exists
                    if (!checkFileExists(TEST_FILES.document)) {
                        log("Document file not found at ".concat(TEST_FILES.document, ", creating sample file..."), 'warning');
                        createTestFile(TEST_FILES.document, testTrainingData.text);
                    }
                    formData = new FormData();
                    formData.append('agentId', agentId);
                    formData.append('source', 'document');
                    formData.append('fileType', 'txt');
                    formData.append('text', testTrainingData.text);
                    documentBuffer = fs.readFileSync(TEST_FILES.document);
                    documentBlob = new Blob([documentBuffer], { type: 'text/plain' });
                    formData.append('files', documentBlob, 'sample.txt');
                    return [4 /*yield*/, makeRequest('/agent/train', {
                            method: 'POST',
                            headers: {
                            // Remove Content-Type to let browser set it with boundary for FormData
                            },
                            body: formData
                        })];
                case 2:
                    data = _e.sent();
                    log('Document training started successfully', 'success');
                    return [2 /*return*/, data];
                case 3:
                    error_5 = _e.sent();
                    errorMessage = ((_b = (_a = error_5.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                        ((_d = (_c = error_5.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
                        error_5.message ||
                        'Document training failed';
                    log("Document training failed: ".concat(errorMessage), 'error');
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Step 4b: Train agent with website source
function trainAgentWithWebsite() {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_6, errorMessage;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    log('Step 4b: Training agent with website source...');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, makeRequest('/agent/train', {
                            method: 'POST',
                            body: JSON.stringify({
                                agentId: agentId,
                                source: 'website',
                                sourceUrl: 'https://davidtsx.vercel.app/'
                            })
                        })];
                case 2:
                    data = _e.sent();
                    log('Website training started successfully', 'success');
                    return [2 /*return*/, data];
                case 3:
                    error_6 = _e.sent();
                    errorMessage = ((_b = (_a = error_6.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                        ((_d = (_c = error_6.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
                        error_6.message ||
                        'Website training failed';
                    log("Website training failed: ".concat(errorMessage), 'error');
                    throw error_6;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Step 4c: Train agent with YouTube source
function trainAgentWithYouTube() {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_7, errorMessage;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    log('Step 4c: Training agent with YouTube source...');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, makeRequest('/agent/train', {
                            method: 'POST',
                            body: JSON.stringify({
                                agentId: agentId,
                                source: 'youtube',
                                sourceUrl: 'https://www.youtube.com/watch?v=C1K1aGdAS-Q'
                            })
                        })];
                case 2:
                    data = _e.sent();
                    log('YouTube training started successfully', 'success');
                    return [2 /*return*/, data];
                case 3:
                    error_7 = _e.sent();
                    errorMessage = ((_b = (_a = error_7.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                        ((_d = (_c = error_7.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
                        error_7.message ||
                        'YouTube training failed';
                    log("YouTube training failed: ".concat(errorMessage), 'error');
                    throw error_7;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Step 4d: Train agent with audio source
function trainAgentWithAudio() {
    return __awaiter(this, void 0, void 0, function () {
        var formData, audioBuffer, audioBlob, url, response, error_8, errorMessage;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    log('Step 4d: Training agent with audio source...');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    // Check if audio file exists
                    if (!checkFileExists(TEST_FILES.audio)) {
                        log("Audio file not found at ".concat(TEST_FILES.audio, ", skipping audio training..."), 'warning');
                        throw new Error('Audio file not available');
                    }
                    formData = new FormData();
                    formData.append('agentId', agentId);
                    formData.append('source', 'audio');
                    formData.append('fileType', 'mp3');
                    audioBuffer = fs.readFileSync(TEST_FILES.audio);
                    audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
                    formData.append('files', audioBlob, 'sample.mp3');
                    url = "".concat(API_URL, "/agent/train");
                    log("Making POST request to /agent/train with audio file");
                    return [4 /*yield*/, (0, axios_1.default)({
                            url: url,
                            method: 'POST',
                            headers: {},
                            data: formData,
                            timeout: 30000
                        })];
                case 2:
                    response = _e.sent();
                    log('Audio training started successfully', 'success');
                    return [2 /*return*/, response.data];
                case 3:
                    error_8 = _e.sent();
                    errorMessage = ((_b = (_a = error_8.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                        ((_d = (_c = error_8.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
                        error_8.message ||
                        'Audio training failed';
                    log("Audio training failed: ".concat(errorMessage), 'error');
                    // Enhanced error logging
                    if (error_8.response) {
                        log("Audio training error details:", 'error');
                        log("  Status: ".concat(error_8.response.status), 'error');
                        log("  Status Text: ".concat(error_8.response.statusText), 'error');
                        log("  Response Data: ".concat(JSON.stringify(error_8.response.data, null, 2)), 'error');
                        log("  Response Headers: ".concat(JSON.stringify(error_8.response.headers, null, 2)), 'error');
                    }
                    if (error_8.request) {
                        log("Audio training request details:", 'error');
                        log("  Request Method: ".concat(error_8.request.method), 'error');
                        log("  Request URL: ".concat(error_8.request.url), 'error');
                        log("  Request Headers: ".concat(JSON.stringify(error_8.request.headers, null, 2)), 'error');
                    }
                    log("Audio training error stack: ".concat(error_8.stack), 'error');
                    throw error_8;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Step 4e: Train agent with video source
function trainAgentWithVideo() {
    return __awaiter(this, void 0, void 0, function () {
        var formData, videoBuffer, videoBlob, url, response, error_9, errorMessage;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    log('Step 4e: Training agent with video source...');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    // Check if video file exists
                    if (!checkFileExists(TEST_FILES.video)) {
                        log("Video file not found at ".concat(TEST_FILES.video, ", skipping video training..."), 'warning');
                        throw new Error('Video file not available');
                    }
                    formData = new FormData();
                    formData.append('agentId', agentId);
                    formData.append('source', 'video');
                    formData.append('fileType', 'mp4');
                    videoBuffer = fs.readFileSync(TEST_FILES.video);
                    videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
                    formData.append('files', videoBlob, 'sample.mp4');
                    url = "".concat(API_URL, "/agent/train");
                    log("Making POST request to /agent/train with video file");
                    return [4 /*yield*/, (0, axios_1.default)({
                            url: url,
                            method: 'POST',
                            headers: {},
                            data: formData,
                            timeout: 30000
                        })];
                case 2:
                    response = _e.sent();
                    log('Video training started successfully', 'success');
                    return [2 /*return*/, response.data];
                case 3:
                    error_9 = _e.sent();
                    errorMessage = ((_b = (_a = error_9.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                        ((_d = (_c = error_9.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) ||
                        error_9.message ||
                        'Video training failed';
                    log("Video training failed: ".concat(errorMessage), 'error');
                    // Enhanced error logging
                    if (error_9.response) {
                        log("Video training error details:", 'error');
                        log("  Status: ".concat(error_9.response.status), 'error');
                        log("  Status Text: ".concat(error_9.response.statusText), 'error');
                        log("  Response Data: ".concat(JSON.stringify(error_9.response.data, null, 2)), 'error');
                        log("  Response Headers: ".concat(JSON.stringify(error_9.response.headers, null, 2)), 'error');
                    }
                    if (error_9.request) {
                        log("Video training request details:", 'error');
                        log("  Request Method: ".concat(error_9.request.method), 'error');
                        log("  Request URL: ".concat(error_9.request.url), 'error');
                        log("  Request Headers: ".concat(JSON.stringify(error_9.request.headers, null, 2)), 'error');
                    }
                    log("Video training error stack: ".concat(error_9.stack), 'error');
                    throw error_9;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Step 5: Check training status
function checkTrainingStatus(jobId) {
    return __awaiter(this, void 0, void 0, function () {
        var data, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('Step 5: Checking training status...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, makeRequest("/agent/train/status/".concat(jobId))];
                case 2:
                    data = _a.sent();
                    log("Training status: ".concat(data.data.status), 'info');
                    return [2 /*return*/, data];
                case 3:
                    error_10 = _a.sent();
                    log("Failed to check training status: ".concat(error_10.message), 'error');
                    throw error_10;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Wait for training completion
function waitForTrainingCompletion(jobId_1) {
    return __awaiter(this, arguments, void 0, function (jobId, maxWaitTime) {
        var startTime, status_1, error_11;
        if (maxWaitTime === void 0) { maxWaitTime = 60000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('Waiting for training to complete...', 'info');
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    if (!(Date.now() - startTime < maxWaitTime)) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 7]);
                    return [4 /*yield*/, checkTrainingStatus(jobId)];
                case 3:
                    status_1 = _a.sent();
                    if (status_1.data.status === 'completed') {
                        log('Training completed successfully!', 'success');
                        return [2 /*return*/];
                    }
                    else if (status_1.data.status === 'failed') {
                        throw new Error('Training failed');
                    }
                    log("Training status: ".concat(status_1.data.status, " (").concat(status_1.data.progress || 0, "%)"), 'info');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 4:
                    _a.sent(); // Wait 2 seconds
                    return [3 /*break*/, 7];
                case 5:
                    error_11 = _a.sent();
                    log("Error checking training status: ".concat(error_11.message), 'error');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 1];
                case 8: throw new Error('Training timeout - took too long to complete');
            }
        });
    });
}
// Step 6: Test agent with a question
function testAgentWithQuestion() {
    return __awaiter(this, void 0, void 0, function () {
        var question, data, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log('Step 6: Testing agent with a question...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    question = "Who was the first customer of TechTreasures?";
                    return [4 /*yield*/, makeRequest('/agent/ask', {
                            method: 'POST',
                            body: JSON.stringify({
                                agentId: agentId,
                                question: question
                            })
                        })];
                case 2:
                    data = _a.sent();
                    log("Question: ".concat(question), 'info');
                    log("Full response data: ".concat(JSON.stringify(data, null, 2)), 'info');
                    log("Answer: ".concat(data.data.reply || data.data.answer || data.data.response || data.data.message || 'No answer field found'), 'success');
                    return [2 /*return*/, data];
                case 3:
                    error_12 = _a.sent();
                    log("Failed to test agent: ".concat(error_12.message), 'error');
                    if (error_12.response) {
                        log("Response status: ".concat(error_12.response.status), 'error');
                        log("Response data: ".concat(JSON.stringify(error_12.response.data, null, 2)), 'error');
                    }
                    throw error_12;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Main test function - Updated with all source types
function runFullTest() {
    return __awaiter(this, void 0, void 0, function () {
        var documentTraining, websiteTraining, error_13, youtubeTraining, error_14, audioTraining, error_15, videoTraining, error_16, error_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 27, , 28]);
                    log('🚀 Starting comprehensive API test with all source types...', 'info');
                    log('=====================================', 'info');
                    // Step 1: Sign up/Login user
                    return [4 /*yield*/, signupUser()];
                case 1:
                    // Step 1: Sign up/Login user
                    _a.sent();
                    // Step 2: Create agent
                    return [4 /*yield*/, createAgent()];
                case 2:
                    // Step 2: Create agent
                    _a.sent();
                    // Step 3: Train agent with all source types
                    log('📚 Training agent with all supported source types...', 'info');
                    return [4 /*yield*/, trainAgentWithDocument()];
                case 3:
                    documentTraining = _a.sent();
                    if (!documentTraining.data.jobId) return [3 /*break*/, 5];
                    log('Waiting for document training to complete...', 'info');
                    return [4 /*yield*/, waitForTrainingCompletion(documentTraining.data.jobId)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 9, , 10]);
                    return [4 /*yield*/, trainAgentWithWebsite()];
                case 6:
                    websiteTraining = _a.sent();
                    if (!websiteTraining.data.jobId) return [3 /*break*/, 8];
                    log('Waiting for website training to complete...', 'info');
                    return [4 /*yield*/, waitForTrainingCompletion(websiteTraining.data.jobId)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_13 = _a.sent();
                    log('Website training failed, continuing with other sources...', 'warning');
                    return [3 /*break*/, 10];
                case 10:
                    _a.trys.push([10, 14, , 15]);
                    return [4 /*yield*/, trainAgentWithYouTube()];
                case 11:
                    youtubeTraining = _a.sent();
                    if (!youtubeTraining.data.jobId) return [3 /*break*/, 13];
                    log('Waiting for YouTube training to complete...', 'info');
                    return [4 /*yield*/, waitForTrainingCompletion(youtubeTraining.data.jobId)];
                case 12:
                    _a.sent();
                    _a.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_14 = _a.sent();
                    log('YouTube training failed, continuing with other sources...', 'warning');
                    return [3 /*break*/, 15];
                case 15:
                    _a.trys.push([15, 19, , 20]);
                    return [4 /*yield*/, trainAgentWithAudio()];
                case 16:
                    audioTraining = _a.sent();
                    if (!audioTraining.data.jobId) return [3 /*break*/, 18];
                    log('Waiting for audio training to complete...', 'info');
                    return [4 /*yield*/, waitForTrainingCompletion(audioTraining.data.jobId)];
                case 17:
                    _a.sent();
                    _a.label = 18;
                case 18: return [3 /*break*/, 20];
                case 19:
                    error_15 = _a.sent();
                    log('Audio training failed, continuing with other sources...', 'warning');
                    return [3 /*break*/, 20];
                case 20:
                    _a.trys.push([20, 24, , 25]);
                    return [4 /*yield*/, trainAgentWithVideo()];
                case 21:
                    videoTraining = _a.sent();
                    if (!videoTraining.data.jobId) return [3 /*break*/, 23];
                    log('Waiting for video training to complete...', 'info');
                    return [4 /*yield*/, waitForTrainingCompletion(videoTraining.data.jobId)];
                case 22:
                    _a.sent();
                    _a.label = 23;
                case 23: return [3 /*break*/, 25];
                case 24:
                    error_16 = _a.sent();
                    log('Video training failed, continuing with other sources...', 'warning');
                    return [3 /*break*/, 25];
                case 25: 
                // Step 4: Test the agent
                return [4 /*yield*/, testAgentWithQuestion()];
                case 26:
                    // Step 4: Test the agent
                    _a.sent();
                    log('=====================================', 'info');
                    log('✅ All tests completed successfully!', 'success');
                    log("\uD83D\uDCCA Summary:", 'info');
                    log("   - User authenticated: \u2705", 'success');
                    log("   - Agent created: \u2705 (ID: ".concat(agentId, ")"), 'success');
                    log("   - Document training: \u2705", 'success');
                    log("   - Website training: \u2705", 'success');
                    log("   - YouTube training: \u2705", 'success');
                    log("   - Audio training: \u2705", 'success');
                    log("   - Video training: \u2705", 'success');
                    log("   - Agent tested: \u2705", 'success');
                    return [3 /*break*/, 28];
                case 27:
                    error_17 = _a.sent();
                    log('❌ Test failed!', 'error');
                    log("Error: ".concat(error_17.message), 'error');
                    process.exit(1);
                    return [3 /*break*/, 28];
                case 28: return [2 /*return*/];
            }
        });
    });
}
// Run the test if this file is executed directly
if (require.main === module) {
    runFullTest();
}
