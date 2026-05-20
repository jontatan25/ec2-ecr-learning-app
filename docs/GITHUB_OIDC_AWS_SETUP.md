# GitHub OIDC AWS Setup

This note explains how to connect GitHub Actions to AWS using OpenID Connect
(OIDC) so the repository can publish Docker images to ECR without storing
long-lived AWS keys in GitHub.

## Goal

Allow GitHub Actions in `jontatan25/ec2-ecr-learning-app` to assume an AWS IAM
role and push images to:

- AWS account: `829643440696`
- AWS region: `eu-north-1`
- ECR repository: `simple-app`

## What I did

I used the local AWS profile:

```bash
AWS_PROFILE=codex-admin
```

I verified that the profile is valid:

```bash
AWS_PROFILE=codex-admin aws sts get-caller-identity
```

That returned:

- account: `829643440696`
- IAM user: `codex-setup-admin`

I created the AWS resources needed for GitHub OIDC:

1. An IAM OIDC provider for `token.actions.githubusercontent.com`
2. An IAM role named `simple-app-ecr-publisher`
3. An IAM inline policy that allows pushing to the `simple-app` ECR repository
4. A GitHub repository variable named `AWS_ROLE_ARN`

## What was created

- OIDC provider:
  `arn:aws:iam::829643440696:oidc-provider/token.actions.githubusercontent.com`
- IAM role:
  `arn:aws:iam::829643440696:role/simple-app-ecr-publisher`
- IAM inline role policy:
  `simple-app-ecr-push`
- GitHub repo variable:
  `AWS_ROLE_ARN=arn:aws:iam::829643440696:role/simple-app-ecr-publisher`

## What I used from the CLI

I used this AWS profile:

```bash
AWS_PROFILE=codex-admin
```

I verified the identity first:

```bash
AWS_PROFILE=codex-admin aws sts get-caller-identity
```

## Exact setup process

### 1. Create the GitHub OIDC provider

```bash
AWS_PROFILE=codex-admin aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. Create the trust policy

Save this as `trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::829643440696:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:jontatan25/ec2-ecr-learning-app:*"
        }
      }
    }
  ]
}
```

### 3. Create the IAM role

```bash
AWS_PROFILE=codex-admin aws iam create-role \
  --role-name simple-app-ecr-publisher \
  --assume-role-policy-document file://trust-policy.json
```

### 4. Create the ECR push policy

Save this as `ecr-push-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      "Resource": "arn:aws:ecr:eu-north-1:829643440696:repository/simple-app"
    }
  ]
}
```

### 5. Attach the policy to the role

```bash
AWS_PROFILE=codex-admin aws iam put-role-policy \
  --role-name simple-app-ecr-publisher \
  --policy-name simple-app-ecr-push \
  --policy-document file://ecr-push-policy.json
```

### 6. Capture the role ARN

The expected ARN will be:

```text
arn:aws:iam::829643440696:role/simple-app-ecr-publisher
```

### 7. Store the ARN in GitHub

Add this repository variable:

- name: `AWS_ROLE_ARN`
- value: `arn:aws:iam::829643440696:role/simple-app-ecr-publisher`

You can do that with GitHub CLI:

```bash
gh variable set AWS_ROLE_ARN \
  --repo jontatan25/ec2-ecr-learning-app \
  --body arn:aws:iam::829643440696:role/simple-app-ecr-publisher
```

### 8. Enable auto publishing

When you are ready for automatic image publishing from `main`, add:

- name: `ECR_PUBLISH_ENABLED`
- value: `true`

CLI version:

```bash
gh variable set ECR_PUBLISH_ENABLED \
  --repo jontatan25/ec2-ecr-learning-app \
  --body true
```

## How the workflow uses this

The repository workflow:

- reads `AWS_ROLE_ARN`
- uses GitHub OIDC to assume that role
- logs into ECR
- builds the Docker image
- smoke-tests `/health`
- pushes `${GITHUB_SHA}` and `latest` tags to `simple-app`

GitHub now has the `AWS_ROLE_ARN` variable set, so the workflow can use OIDC
without storing long-lived AWS access keys.

## How to do it yourself next time

1. Confirm the target AWS account, region, and ECR repository.
2. Create or reuse the GitHub OIDC provider in AWS.
3. Create a narrowly scoped IAM role that trusts only the target GitHub repo.
4. Attach only the permissions needed for ECR push.
5. Put the role ARN in GitHub as `AWS_ROLE_ARN`.
6. Enable the publish workflow with `ECR_PUBLISH_ENABLED=true`.
7. Trigger the workflow and verify the image appears in ECR.

## Current status

- ECR repository `simple-app` exists
- manual CLI push to ECR already works
- GitHub OIDC provider exists in AWS
- IAM role `simple-app-ecr-publisher` exists
- GitHub variable `AWS_ROLE_ARN` is set
- `ECR_PUBLISH_ENABLED` is still intentionally unset so auto-publishing from `main` stays off until you want it
