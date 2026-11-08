# Backend Setup & Testing Guide

## 🚀 Running the Backend Locally

Since Railway deployment requires credits, you can run the backend server locally and test all your tRPC endpoints.

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
bun tsx server.ts
```

Or with watch mode (auto-restart on changes):

```bash
bun tsx watch server.ts
```

The server will start on `http://localhost:3000`

### Step 2: Update Environment Variable

Set your backend URL to localhost. In your environment variables, update:

```
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
```

For web testing, use:
```
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
```

For mobile device testing (phone on same network), use your computer's local IP:
```
EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.X.X:3000
```

### Step 3: Start the Expo App

In another terminal:

```bash
bun start
```

## 📡 Available API Endpoints

### Health Check
- **URL**: `http://localhost:3000/`
- **Method**: GET
- **Response**: Server status and available endpoints

### tRPC Endpoints

All tRPC endpoints are available at `http://localhost:3000/api/trpc/`

#### Demo Routes (releases router):

1. **releases.demo** (Query)
   - Simple hello world endpoint
   - Returns: message, timestamp, version

2. **releases.echo** (Mutation)
   - Send a message and get it back in uppercase
   - Input: `{ message: string }`
   - Returns: original, echoed, length, timestamp

3. **releases.health** (Query)
   - Check API health and database status
   - Returns: status, timestamp, service, version, database info

4. **releases.getAll** (Query)
   - Fetch all releases from database
   - Returns: Array of releases

5. **releases.getStats** (Query)
   - Get aggregate statistics
   - Returns: totalReleases, uniqueArtists, botCompletion, etc.

6. **releases.search** (Query)
   - Search releases by artist or track
   - Input: `{ query: string, field?: 'artist' | 'track' | 'all' }`
   - Returns: Filtered releases

7. **releases.getById** (Query)
   - Fetch specific release by ID
   - Input: `{ id: string }`
   - Returns: Single release

8. **releases.create** (Mutation)
   - Create a new release (requires auth)
   - Input: `{ artist: string, track: string, timestamp: string }`
   - Returns: Created release with bot statuses

## 🧪 Testing with the Test API Screen

Navigate to the "Test API" tab in your app. You'll see:

- **Basic Endpoints Section**: Test demo, health, getAll, and stats endpoints
- **Echo Mutation Section**: Send messages and get them back transformed
- **Search Endpoint Section**: Search releases by artist or track
- **Get By ID Section**: Fetch specific releases

Use the "Run All Tests" button to test all basic endpoints at once.

## 🔍 Debugging Tips

1. **Check server logs**: The backend logs all requests with timestamps and emojis
2. **Check console**: The app logs all tRPC requests with detailed info
3. **Test health endpoint first**: `curl http://localhost:3000/`
4. **Check network tab**: In browser dev tools, inspect actual requests

## 📝 Adding New Routes

To add new tRPC routes:

1. Open `backend/trpc/routes/YOUR_ROUTER.ts`
2. Add new procedure:
   ```typescript
   myEndpoint: publicProcedure
     .input(z.object({ ... }))
     .query(async ({ input }) => {
       // Your logic here
       return { ... };
     }),
   ```
3. Use in frontend:
   ```typescript
   const query = trpc.YOUR_ROUTER.myEndpoint.useQuery({ ... });
   ```

## 🌐 Deploying Backend

When ready to deploy:

1. **Railway**: Push to GitHub, connect repo, Railway auto-deploys
2. **Heroku**: `git push heroku main`
3. **Render**: Connect GitHub repo, auto-deploy
4. **Vercel**: Add `vercel.json` config for serverless functions

After deployment, update `EXPO_PUBLIC_RORK_API_BASE_URL` to your deployed URL.
