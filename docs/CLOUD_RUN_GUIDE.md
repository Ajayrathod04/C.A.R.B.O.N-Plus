# Google Cloud Run Deployment Guide

This guide walks you through deploying C.A.R.B.O.N+ on **Google Cloud Run**.

## Step 1: Install and Initialize GCP CLI
1. Install the Google Cloud SDK: [cloud.google.com/sdk](https://cloud.google.com/sdk)
2. Open terminal and run:
   ```bash
   gcloud init
   ```
3. Set your active project:
   ```bash
   gcloud config set project your-gcp-project-id
   ```

## Step 2: Enable GCP Services
Enable the required APIs:
```bash
gcloud services enable run.googleapis.com \
                       containerregistry.googleapis.com \
                       cloudbuild.googleapis.com \
                       firestore.googleapis.com
```

## Step 3: Configure Firestore
1. Navigate to the GCP Console -> Firestore.
2. Click **Create Database**.
3. Select **Native Mode**.
4. Set location and database ID to `(default)`.

## Step 4: Deploy the App
Deploy directly from your source directory. GCP Cloud Build will package the code using the Dockerfile and deploy to Cloud Run:
```bash
gcloud run deploy carbon-plus \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080,FIRESTORE_PROJECT_ID=your-gcp-project-id
```

## Step 5: Verify Deployment
Once completed, the CLI will output a service URL (e.g., `https://carbon-plus-abcdef-uc.a.run.app`). Visit the URL to verify your live deployment!
All stdout/stderr logs will be captured and structured automatically inside Google Cloud Logging.
