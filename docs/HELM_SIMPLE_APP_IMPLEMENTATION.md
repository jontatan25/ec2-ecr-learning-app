# Helm Implementation For Simple App

This document explains how the raw Kubernetes setup was converted into a Helm
chart for the current learning app, with separate dev and prod environments.

It is written as both a record of the implementation and a learning guide so
you can understand the reasoning behind each change.

## Goal

The goal was to stop using only a raw Kubernetes deployment manifest and move
to a reusable Helm chart for the real app in this repository.

The final target was:

1. a Helm chart that represents the current app, not the placeholder nginx demo
2. separate dev and prod configuration
3. health checks aligned with the app’s real `/health` endpoint
4. a chart structure that is easier to learn from than the default generated scaffold

## Starting point

Before this change, the repo had:

- a raw manifest in `k8s/nginx-deployment.yaml`
- a generated Helm scaffold created with `helm create nginx-chart`

The raw manifest was still the basic nginx example and did not represent the
real app in this repository.

The generated Helm chart also still reflected the default scaffold:

- chart name was `nginx-chart`
- image was `nginx`
- default port was `80`
- it included extra optional templates such as Ingress and HTTPRoute

That meant the chart was useful for learning Helm structure, but it was not yet
an implementation of the real app.

## Main design decisions

### 1. Keep Helm in its own folder

The chart was moved under:

```text
helm/simple-app
```

Why:

- `k8s/` is a good place for raw manifests
- `helm/` is a good place for Helm charts
- separating them makes the repo easier to read

This gives the repo a clearer structure:

```text
k8s/   -> raw Kubernetes YAML
helm/  -> Helm charts
docs/  -> explanations and learning notes
```

### 2. Rename the chart to match the real app

The generated chart name `nginx-chart` was replaced with `simple-app`.

Why:

- Helm charts should reflect the real service they deploy
- using the real app name reduces confusion
- helper templates, labels, and rendered resource names become more meaningful

### 3. Use the current app configuration as the source of truth

The chart was aligned with the real application defaults already present in the
repo:

- app name: `simple-app`
- port: `4000`
- region: `eu-north-1`
- ECR repository: `simple-app`
- health endpoint: `/health`

Why:

- the Helm chart should deploy the same app behavior as local Docker and app config
- if Helm, Docker, and app defaults disagree, learning becomes confusing

### 4. Support environments through values files

Instead of duplicating templates, the chart uses:

- `values.yaml` as the common base
- `values-dev.yaml` for development overrides
- `values-prod.yaml` for production overrides

Why:

- this is one of the core reasons Helm is useful
- same templates, different inputs
- easier to compare environments

### 5. Simplify the generated chart

The default scaffold included optional templates that were not needed for the
current goal:

- Ingress
- HTTPRoute

These were removed.

Why:

- they are valid Helm concepts, but they are not required to deploy the app
- removing them makes the chart easier to read while learning
- the chart stays focused on Deployment + Service + environment-specific values

The HPA template was kept, but disabled by default.

Why:

- autoscaling is a useful future concept
- keeping it disabled avoids adding complexity to the first deployment

## What changed

### Chart metadata

File:

```text
helm/simple-app/Chart.yaml
```

Changes:

- renamed chart to `simple-app`
- updated chart description
- bumped chart version to `0.2.0`
- set `appVersion` to `latest`

Why:

- the chart now reflects the real app
- the version bump marks a meaningful chart change

### Base values

File:

```text
helm/simple-app/values.yaml
```

Changes:

- switched image defaults from `nginx` to `simple-app`
- changed service port from `80` to `4000`
- added explicit app config values:
  - `APP_NAME`
  - `APP_ENV`
  - `HOST`
  - `PORT`
  - `AWS_REGION`
  - `ECR_REPOSITORY`
- added real resource requests and limits
- changed liveness and readiness probes to use `/health`
- disabled service account creation by default

Why:

- the values file should describe the current app clearly
- explicit app config makes the chart easier to understand than hiding everything in one image string
- `/health` is the real app health endpoint, so probes should check the real signal

### Dev values

File:

```text
helm/simple-app/values-dev.yaml
```

Changes:

- `replicaCount: 1`
- local image reference: `simple-app:dev`
- `APP_ENV=development`
- smaller resource limits

Why:

- dev should be light and simple
- one replica is enough for local or learning environments
- using a local image name matches the idea of building locally during development

### Prod values

File:

```text
helm/simple-app/values-prod.yaml
```

Changes:

- `replicaCount: 2`
- image points to the ECR repository
- image pull policy is `Always`
- `APP_ENV=production`
- stronger resource requests and limits

Why:

- prod should use the published registry image
- more than one replica is a better production default
- resource settings should reflect a more stable runtime expectation

### Deployment template

File:

```text
helm/simple-app/templates/deployment.yaml
```

Changes:

- renamed helper references from `nginx-chart.*` to `simple-app.*`
- switched container image to values-driven simple-app image
- changed container port to `4000`
- added explicit environment variables for the app
- kept support for resources, probes, node selectors, tolerations, affinity, and volume hooks

Why:

- the Deployment is the heart of the chart
- it needed to reflect the real app runtime
- explicit env vars make it obvious how Helm values become container configuration

### Service template

File:

```text
helm/simple-app/templates/service.yaml
```

Changes:

- renamed helper references
- switched the service port to `4000`

Why:

- the service must match the app’s real listening port

### Service account template

File:

```text
helm/simple-app/templates/serviceaccount.yaml
```

Changes:

- renamed helper references
- kept optional service account creation support

Why:

- this keeps the chart extensible without making it required for the first version

### Helm test

File:

```text
helm/simple-app/templates/tests/test-connection.yaml
```

Changes:

- renamed helper references
- changed the test target to `/health`

Why:

- the Helm test should validate the real app endpoint, not just raw connectivity

### Notes template

File:

```text
helm/simple-app/templates/NOTES.txt
```

Changes:

- simplified the generated notes
- focused them on `helm list`, `kubectl get`, and `kubectl port-forward`

Why:

- the default notes were more generic than needed
- the new notes match the learning path for this repo

## What was intentionally removed

Removed templates:

- `templates/ingress.yaml`
- `templates/httproute.yaml`

Why:

- they were not required to deploy the app
- they added noise while learning the core Helm concepts
- they can be added back later when you specifically learn traffic routing

## How dev and prod work now

The chart now uses one template set with different values files.

This is the key Helm concept you wanted to practice.

### Dev

Use:

```bash
helm template simple-app-dev helm/simple-app -f helm/simple-app/values-dev.yaml
```

Characteristics:

- 1 replica
- local image name
- development environment variable
- lighter resources

### Prod

Use:

```bash
helm template simple-app-prod helm/simple-app -f helm/simple-app/values-prod.yaml
```

Characteristics:

- 2 replicas
- ECR image
- production environment variable
- stronger resource settings

### Local prod simulation

Use:

```bash
helm template simple-app-prod helm/simple-app \
  -f helm/simple-app/values-prod.yaml \
  -f helm/simple-app/values-prod-local.yaml
```

Characteristics:

- still uses the production image reference
- keeps production env and resource settings
- overrides `image.pullPolicy` to `IfNotPresent`

Why:

- real production should keep `Always`
- local Minikube testing usually preloads the image onto the node
- `IfNotPresent` lets Kubernetes use the image already loaded into Minikube instead of trying to re-authenticate to ECR on every start

## Validation performed

These checks were run:

```bash
helm lint helm/simple-app
helm template simple-app-dev helm/simple-app -f helm/simple-app/values-dev.yaml
helm template simple-app-prod helm/simple-app -f helm/simple-app/values-prod.yaml
helm template simple-app-prod helm/simple-app -f helm/simple-app/values-prod.yaml -f helm/simple-app/values-prod-local.yaml
```

Result:

- lint passed
- both dev and prod templates rendered successfully

This confirmed:

- the chart syntax is valid
- the helper renaming is correct
- the values files are wired correctly
- the rendered manifests match the intended environment behavior

## Why this approach is good for learning

This implementation is useful because it teaches the most important Helm ideas
without too much noise.

You can now clearly see:

1. how `values.yaml` becomes container config
2. how one chart supports multiple environments
3. how a Deployment and Service are templated
4. how helper templates standardize names and labels
5. how Helm lets you reuse one app definition without copying YAML

## What to do next

Good next exercises:

1. run `helm template` for dev and prod and compare the outputs
2. install the dev chart into Minikube
3. port-forward the service and call `/health`
4. change `replicaCount` and run `helm upgrade`
5. change `image.tag` and observe the rendered difference
6. later, add Ingress back on purpose when you learn routing

## Most important takeaway

The biggest change was not “rewriting YAML in Helm syntax.”

The real improvement was:

- taking one real app
- defining shared deployment logic once
- separating environment differences into values

That is the core reason Helm is useful in real projects.
