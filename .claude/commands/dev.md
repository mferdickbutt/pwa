---
description: Start all development services (frontend, Media API, Firebase emulators, MinIO)
allowed-tools: Bash(npm, docker-compose, firebase), Read
---

# Dev Command

Your task is to: $ARGUMENTS

Start all development services for TimeHut PWA.

## Steps

1. **Start MinIO** (Docker)
   ```bash
   docker-compose up -d
   ```

2. **Start Firebase Emulators**
   ```bash
   cd firebase
   firebase emulators:start
   ```

3. **Start Media API** (Node.js)
   ```bash
   cd packages/media-api
   npm run dev
   ```

4. **Start Frontend** (Vite)
   ```bash
   cd packages/frontend
   npm run dev
   ```

5. **Or use root script**
   ```bash
   npm run dev
   ```
   This starts frontend + API concurrently.

## Verify Services

Check that all services are running:
- **MinIO**: http://localhost:9001 (Console), http://localhost:9000 (API)
- **Firebase UI**: http://localhost:4000
- **Media API**: http://localhost:8787
- **Frontend**: http://localhost:5173

## Output

Report:
- Which services started successfully
- Which services failed (if any)
- URLs for each service
- Any errors or warnings

## Notes

- Frontend runs on http://localhost:5173 with hot module replacement (HMR)
- Media API handles presigned URL generation for S3-compatible storage
- Firebase emulators provide Auth and Firestore for local development
- MinIO provides S3-compatible storage for local development

## Common Issues

**MinIO port conflict:**
- Change ports in docker-compose.yml
- Or stop other Docker containers

**Firebase emulator conflict:**
- Kill existing firebase emulators: `firebase emulators:kill`
- Then start again

**Port already in use:**
- Find process: `lsof -i :5173`
- Kill process or change port in vite.config.ts
