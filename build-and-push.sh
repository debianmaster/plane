#!/bin/bash
set -e

REGISTRY="${REGISTRY:-debianmaster}"
TAG="${TAG:-v1}"
PLATFORM="${PLATFORM:-linux/amd64}"

echo "Building and pushing images to ${REGISTRY}/*:${TAG} for ${PLATFORM}"

docker buildx build --platform "${PLATFORM}" -t "${REGISTRY}/plane-api:${TAG}" -f apps/api/Dockerfile.api apps/api/ --push &
docker buildx build --platform "${PLATFORM}" -t "${REGISTRY}/plane-admin:${TAG}" -f apps/admin/Dockerfile.admin . --push &
docker buildx build --platform "${PLATFORM}" -t "${REGISTRY}/plane-web:${TAG}" -f apps/web/Dockerfile.web . --push &
docker buildx build --platform "${PLATFORM}" -t "${REGISTRY}/plane-space:${TAG}" -f apps/space/Dockerfile.space . --push &

wait
echo "All images pushed successfully."
