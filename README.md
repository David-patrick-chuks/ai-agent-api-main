# AI Agent API Backend

A production-ready TypeScript Express backend with MongoDB for authentication (email/password, Google OAuth, JWT with refresh tokens).

## Features
- Email/password signup & login
- Google OAuth (Passport.js)
- JWT-based authentication (access & refresh tokens)
- Secure session management
- MongoDB (Mongoose)
- Production best practices (helmet, CORS, error handling)

## Getting Started

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/aiagent
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=your_session_secret
PORT=5000
```

### 3. Run the Server
Development:
```bash
npx ts-node-dev src/app.ts
```
Production:
```bash
npm run build
npm start
```

## API Endpoints

### Auth
- `POST /api/auth/signup` — `{ email, password, name }`
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/refresh` — `{ refreshToken }`
- `POST /api/auth/logout` — `{ refreshToken }`
- `GET /api/auth/google` — Google OAuth login
- `GET /api/auth/google/callback` — Google OAuth callback

### User
- `GET /api/users/me` — Get current user profile (JWT required)

## Security Notes
- Use strong secrets in production
- Use HTTPS in production
- Set secure cookies and CORS origins appropriately
- Rotate refresh tokens on use

## License
MIT 