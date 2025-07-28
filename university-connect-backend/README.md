# University Connect Backend

## Deployment Instructions for Render

### 1. Environment Variables
Set the following environment variables in Render:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=5000
```

### 2. Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: `18.18.0`

### 3. Deployment Notes

#### Common Issues and Solutions:

1. **bcryptjs/bcrypt Module Errors**:
   - The app includes both `bcryptjs` and `bcrypt` as dependencies
   - Custom utility in `utils/bcryptUtil.js` handles fallbacks automatically
   - Build script forces clean installation to avoid corrupted packages

2. **Mongoose Connection Issues**:
   - Updated to Mongoose 8.x for better Node.js 22 compatibility
   - Includes retry logic and better error handling
   - Removes deprecated connection options

3. **Node.js Version**:
   - Use Node.js 18.18.0 for best compatibility
   - `.nvmrc` file specifies the version

#### Build Process:
1. Clean npm cache
2. Remove existing node_modules
3. Fresh npm install with fallbacks
4. Verify critical modules load correctly
5. Run preflight checks before starting

#### Health Checks:
- `GET /` - API status and info
- `GET /health` - Detailed health check

#### CORS Configuration:
Includes both localhost (development) and production URLs:
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (React dev)
- `https://uniconnect.prasadshaswat.tech` (Production frontend)

### 4. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run preflight checks
npm run preflight

# Clean install
npm run clean
```

### 5. Production Deployment

The app is configured for automatic deployment on Render with:
- Automatic builds on git push
- Health check endpoints
- Error logging and monitoring
- Graceful error handling
