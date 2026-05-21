#!/bin/sh
set -euo pipefail

echo "Waiting for MinIO to be ready..."
until mc alias set local http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" --api S3v4; do
  echo "  Retrying MinIO connection..."
  sleep 2
done
echo "MinIO connection established"

echo "Creating bucket: $MINIO_BUCKET"
mc mb "local/$MINIO_BUCKET" --ignore-existing
echo "Bucket created/verified"

echo "Setting public read policy on bucket..."
mc anonymous set download "local/$MINIO_BUCKET"
echo "Public read policy applied"

echo "Creating service account: $MINIO_ACCESS_KEY_ID"
if ! mc admin user info local "$MINIO_ACCESS_KEY_ID" >/dev/null 2>&1; then
  mc admin user add local "$MINIO_ACCESS_KEY_ID" "$MINIO_SECRET_ACCESS_KEY"
  echo "User created"
else
  echo "User already exists"
fi

echo "Attaching readwrite policy to service account..."
mc admin policy attach local readwrite --user "$MINIO_ACCESS_KEY_ID"
echo "Policy attached"

echo "MinIO initialization complete!"
