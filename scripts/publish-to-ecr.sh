#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-eu-north-1}"
ECR_REPOSITORY="${ECR_REPOSITORY:-simple-app}"
IMAGE_NAME="${IMAGE_NAME:-simple-app}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD)}"
PUSH_LATEST="${PUSH_LATEST:-false}"

AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
REMOTE_IMAGE="${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

aws ecr describe-repositories --repository-names "${ECR_REPOSITORY}" --region "${AWS_REGION}" >/dev/null
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${REMOTE_IMAGE}"
docker push "${REMOTE_IMAGE}"

if [[ "${PUSH_LATEST}" == "true" ]]; then
  docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
  docker push "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
fi

echo "Pushed ${REMOTE_IMAGE}"
