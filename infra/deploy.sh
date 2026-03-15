#!/bin/bash
set -euo pipefail

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:?Set GOOGLE_CLOUD_PROJECT env var}"
REGION="${REGION:-us-central1}"
API_KEY="${GOOGLE_API_KEY:?Set GOOGLE_API_KEY env var}"

echo "=== Deploying Story Forge to Google Cloud Run ==="
echo "Project: $PROJECT_ID | Region: $REGION"

# Enable required APIs
echo "Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  texttospeech.googleapis.com \
  --project="$PROJECT_ID"

# Create GCS bucket if needed
BUCKET_NAME="story-forge-media-${PROJECT_ID}"
if ! gsutil ls -b "gs://${BUCKET_NAME}" &>/dev/null; then
  echo "Creating storage bucket..."
  gsutil mb -p "$PROJECT_ID" -l "$REGION" "gs://${BUCKET_NAME}"
  gsutil iam ch allUsers:objectViewer "gs://${BUCKET_NAME}"
fi

# Deploy backend
echo "Deploying backend..."
gcloud run deploy story-forge-api \
  --source=backend/ \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_API_KEY=${API_KEY},GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GCS_BUCKET_NAME=${BUCKET_NAME}" \
  --session-affinity \
  --timeout=300 \
  --memory=512Mi

# Get backend URL
API_URL=$(gcloud run services describe story-forge-api \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

echo "Backend deployed: $API_URL"

# Deploy frontend
echo "Deploying frontend..."
gcloud run deploy story-forge-web \
  --source=frontend/ \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_API_URL=${API_URL}" \
  --memory=512Mi

FRONTEND_URL=$(gcloud run services describe story-forge-web \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $API_URL"
echo "Bucket:   gs://${BUCKET_NAME}"
