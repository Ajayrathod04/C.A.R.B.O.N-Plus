# C.A.R.B.O.N+ Deployment Manual

This document details deploying the C.A.R.B.O.N+ application onto Google Cloud Run, local environments, or traditional VMs.

## Pre-requisites
- Node.js (v18 or above)
- Docker (optional, for containerized deployments)
- Google Cloud SDK CLI installed (for GCP deployments)

## Local Deployment

### 1. Configure Environmental Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=8080
NODE_ENV=development
CORS_ORIGIN=*
FIRESTORE_PROJECT_ID=your-gcp-project-id
FIRESTORE_DATABASE_ID=(default)
```

### 2. Build Frontend
Navigate to `frontend/` and build:
```bash
cd frontend
npm install
npm run build
```

### 3. Start Backend
Navigate to `backend/` and start:
```bash
cd ../backend
npm install
npm start
```
Go to `http://localhost:8080` in your web browser.

---

## Containerized Deployment (Docker)

To run the application inside a container, use the root Dockerfile.

### Build Image
```bash
docker build -t carbon-plus .
```

### Run Container
```bash
docker run -p 8080:8080 --env PORT=8080 carbon-plus
```

---

## Google Cloud Run Deployment

Cloud Run is the recommended environment for C.A.R.B.O.N+. It scales automatically and is highly cost-effective.

### Quick Deploy (GCP CLI)
Run the following from the root directory:
```bash
gcloud run deploy carbon-plus \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080
```
This command automatically triggers GCP Cloud Build, packages the code using the Dockerfile, uploads it to Artifact Registry, and spawns the Cloud Run service.
 