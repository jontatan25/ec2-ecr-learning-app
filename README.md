# EC2 + ECR Learning App

This repository contains a deliberately small Node.js web app that we can use
to practice:

- Running a web service on an EC2 instance
- Building a Docker image locally
- Pushing that image to Amazon ECR
- Pulling and running the image from EC2

## Local development

```bash
npm start
```

The app starts on `http://localhost:3000`.
For container and EC2 use cases, `HOST=0.0.0.0` is already configured in the
Docker image.

## Docker

Build the image:

```bash
docker build -t ec2-ecr-learning-app .
```

Run the image:

```bash
docker run --rm -p 3000:3000 ec2-ecr-learning-app
```

## Suggested AWS flow

1. Authenticate the AWS CLI with `aws configure`.
2. Create an ECR repository.
3. Tag and push this image to ECR.
4. Pull and run the image on an EC2 instance.

## Health check

The app exposes `GET /health` and returns:

```json
{"ok":true,"service":"ec2-ecr-learning-app"}
```
