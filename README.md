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

The app starts on `http://localhost:3000` by default.

## Environment variables

Copy `.env.example` to `.env` or export values in your shell.

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_NAME` | `ec2-ecr-learning-app` | Service name returned by `/health` |
| `APP_ENV` | `development` | Runtime environment label |
| `HOST` | `127.0.0.1` | Bind host for local runs |
| `PORT` | `3000` | HTTP port |
| `AWS_REGION` | `eu-west-1` | Default AWS region shown in the demo |
| `ECR_REPOSITORY` | `ec2-ecr-learning-app` | Repository name shown in the app and health payload |

## Docker

Build the image:

```bash
docker build -t ec2-ecr-learning-app .
```

Run the image:

```bash
docker run --rm -p 3000:3000 ec2-ecr-learning-app
```

Or use Docker Compose:

```bash
docker compose up --build
```

The container listens on `0.0.0.0:3000`.
If host port `3000` is already in use, run `APP_HOST_PORT=3001 docker compose up --build`.

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
2. Create the ECR repository named by `ECR_REPOSITORY`.
3. Build and tag the image for ECR.
4. Push the image to ECR.
5. Pull the image onto EC2 and run it with the required environment variables.
6. Point health checks to `GET /health`.

For EC2 and container deployments, `HOST=0.0.0.0` should be used so the process is reachable from outside the container.

## Branch protection and checks

The repository is set up to use a GitHub Actions job named `ci` as the required status check on `main`.

Qlty coverage publishing is wired in the workflow but guarded behind the repository variable `QLTY_ENABLED=true`. Once Qlty is connected to the repo, enable coverage statuses in Qlty and add `Qlty Coverage` and `Qlty Diff Coverage` to branch protection if you want them enforced alongside `ci`.

## Suggested AWS flow

1. Authenticate the AWS CLI with `aws configure`.
2. Create an ECR repository.
3. Tag and push this image to ECR.
4. Pull and run the image on an EC2 instance.

## Health check

The app exposes `GET /health` and returns metadata such as:

```json
{
  "ok": true,
  "service": "ec2-ecr-learning-app",
  "environment": "development",
  "awsRegion": "eu-west-1",
  "repository": "ec2-ecr-learning-app"
}
```
