# EC2 + ECR Learning App

This repository contains a deliberately small Node.js web app that we can use
to practice:

- Running a web service on an EC2 instance
- Building a Docker image locally
- Pushing that image to Amazon ECR
- Pulling and running the image from EC2

## What this phase includes

- Dockerized app runtime
- `GET /health` for container and load balancer checks
- Environment-driven config for local, CI, and AWS deployments
- Automated tests plus LCOV coverage output
- GitHub Actions CI with optional Qlty upload
- Branch protection-ready required check name: `ci`
- Phase 2 ECR publishing for `simple-app`

## Local run

Install dependencies:

```bash
npm ci
```

Run the app directly:

```bash
npm start
```

Run with hot reload:

```bash
npm run dev
```

The app starts on `http://localhost:4000` by default.

## Environment variables

Copy `.env.example` to `.env` or export values in your shell.

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_NAME` | `simple-app` | Service name returned by `/health` |
| `APP_ENV` | `development` | Runtime environment label |
| `HOST` | `127.0.0.1` | Bind host for local runs |
| `PORT` | `4000` | HTTP port |
| `AWS_REGION` | `eu-north-1` | Default AWS region shown in the demo |
| `ECR_REPOSITORY` | `simple-app` | Repository name shown in the app and health payload |

## Docker

Build the image:

```bash
docker build -t simple-app .
```

Run the image:

```bash
docker run --rm -p 4000:4000 simple-app
```

Or use Docker Compose:

```bash
docker compose up --build
```

The container listens on `0.0.0.0:4000`.
If host port `4000` is already in use, run `APP_HOST_PORT=4001 docker compose up --build`.

## Testing and coverage

Run tests:

```bash
npm test
```

Generate coverage locally:

```bash
npm run coverage
```

Enforce CI coverage thresholds:

```bash
npm run coverage:check
```

LCOV output is written to `coverage/lcov.info`, which Qlty consumes.

## Deployment notes

1. Authenticate the AWS CLI with `aws configure`.
2. Confirm the target ECR repository exists before pushing.
3. Build and tag the image for ECR.
4. Push the image to ECR.
5. Pull the image onto EC2 and run it with the required environment variables.
6. Point health checks to `GET /health`.

For EC2 and container deployments, `HOST=0.0.0.0` should be used so the process is reachable from outside the container.

## Phase 2: Container + ECR

The current ECR target is:

- AWS account: `829643440696`
- Region: `eu-north-1`
- Repository: `simple-app`
- Repository URI: `829643440696.dkr.ecr.eu-north-1.amazonaws.com/simple-app`

### Manual publish flow

Build, log in, tag, and push manually:

```bash
export AWS_REGION=eu-north-1
export AWS_ACCOUNT_ID=829643440696
export ECR_REPOSITORY=simple-app
export IMAGE_TAG=$(git rev-parse --short HEAD)
export ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

docker build -t simple-app:${IMAGE_TAG} .
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
docker tag simple-app:${IMAGE_TAG} "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
docker tag simple-app:${IMAGE_TAG} "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
docker push "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
docker push "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
```

Or use the helper script:

```bash
./scripts/publish-to-ecr.sh
```

Set `PUSH_LATEST=true` if you also want to push the `latest` tag.

### CI image publishing

The repo now includes [.github/workflows/publish-image.yml](/Users/jonathan.sarmiento/github/ec2-ecr-learning-app/.github/workflows/publish-image.yml:1).

It supports two auth modes:

- Recommended: set repo variable `AWS_ROLE_ARN` and use GitHub OIDC
- Fallback: set repo secrets `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

Automatic pushes from `main` stay disabled until you set repo variable `ECR_PUBLISH_ENABLED=true`.

The workflow:

- builds the Docker image
- smoke-tests `/health` in CI
- tags the image with `${GITHUB_SHA}` and `latest`
- pushes both tags to `simple-app` in ECR

### ECR permissions note

The `simple-app` repository currently has no explicit repository policy attached. That is fine for same-account access when the IAM principal already has ECR push permissions, but cross-account CI or shared infra roles would need either an ECR repository policy or an IAM role arrangement that grants push access.

## Branch protection and checks

The repository is set up to use a GitHub Actions job named `ci` as the required status check on `main`.

Qlty coverage publishing is wired in the workflow but guarded behind the repository variable `QLTY_ENABLED=true`. Once Qlty is connected to the repo, enable coverage statuses in Qlty and add `Qlty Coverage` and `Qlty Diff Coverage` to branch protection if you want them enforced alongside `ci`.

## Suggested AWS flow

1. Authenticate the AWS CLI with `aws configure`.
2. Confirm `simple-app` exists in ECR.
3. Tag and push this image to ECR.
4. Pull and run the image on an EC2 instance.

## Health check

The app exposes `GET /health` and returns metadata such as:

```json
{
  "ok": true,
  "service": "simple-app",
  "environment": "development",
  "awsRegion": "eu-north-1",
  "repository": "simple-app"
}
```
