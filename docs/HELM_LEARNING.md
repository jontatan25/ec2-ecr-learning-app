# Helm Learning

This note gives you the first Helm commands to practice, what they mean, and a
simple order to learn them hands-on.

## What Helm is

Helm is a package manager for Kubernetes.

It helps you:

- group Kubernetes YAML files into a reusable chart
- template values instead of repeating hardcoded YAML
- install and upgrade applications more consistently
- manage Kubernetes apps as versions and releases

A useful mental model is:

- Kubernetes YAML = raw manifests
- Helm chart = reusable Kubernetes app template
- Helm release = one installed instance of a chart

## The first 5 commands to practice

### 1. Check Helm is installed

```bash
helm version
```

What it does:

- confirms Helm is installed
- shows the client version

Why it matters:

- always verify your CLI before starting

### 2. Create your first chart

```bash
helm create my-chart
```

What it does:

- generates a starter Helm chart folder

Why it matters:

- this is the fastest way to see the standard Helm chart structure

What gets created:

- `Chart.yaml`
- `values.yaml`
- `templates/`
- helper template files

### 3. Inspect the generated chart

```bash
ls my-chart
ls my-chart/templates
cat my-chart/Chart.yaml
cat my-chart/values.yaml
```

What it does:

- helps you understand the chart anatomy

Why it matters:

- Helm is easier once you understand where values and templates live

### 4. Render the chart locally

```bash
helm template my-release my-chart
```

What it does:

- renders the Kubernetes YAML without installing it

Why it matters:

- this is one of the most important Helm commands
- it shows exactly what Kubernetes would receive

Mental model:

- Helm template in
- Kubernetes YAML out

### 5. Install the chart into your local cluster

```bash
helm install my-release my-chart
```

What it does:

- installs the chart into your current Kubernetes cluster

Why it matters:

- this is how Helm turns a chart into a release

## Next useful commands

### List releases

```bash
helm list
```

Use it to:

- see what Helm releases are installed

### Upgrade a release

```bash
helm upgrade my-release my-chart
```

Use it to:

- apply changes after editing the chart

### Uninstall a release

```bash
helm uninstall my-release
```

Use it to:

- remove the installed app cleanly

### Show values

```bash
helm show values my-chart
```

Use it to:

- inspect the chart defaults

### Lint a chart

```bash
helm lint my-chart
```

Use it to:

- catch common chart mistakes early

## Recommended hands-on path

### Step 1. Generate a chart

Run:

```bash
helm create nginx-chart
```

Then inspect:

```bash
ls nginx-chart
ls nginx-chart/templates
```

Goal:

- understand the default structure

### Step 2. Render before installing

Run:

```bash
helm template nginx-release nginx-chart
```

Goal:

- see that Helm produces plain Kubernetes YAML

Key lesson:

- Helm does not replace Kubernetes
- Helm generates Kubernetes manifests for you

### Step 3. Compare Helm output with your raw YAML

Compare:

- your raw deployment file in `k8s/nginx-deployment.yaml`
- the YAML rendered by `helm template`

Goal:

- understand the difference between static YAML and templated YAML

### Step 4. Install to Minikube

Run:

```bash
helm install nginx-release nginx-chart
kubectl get all
helm list
```

Goal:

- connect Helm releases to real cluster objects

### Step 5. Change a value and upgrade

Edit `nginx-chart/values.yaml`, for example:

- replica count
- image tag
- service type

Then run:

```bash
helm upgrade nginx-release nginx-chart
```

Goal:

- understand how Helm manages updates

### Step 6. Delete the release

Run:

```bash
helm uninstall nginx-release
```

Goal:

- understand release lifecycle

## What to focus on while learning

Do not try to learn every Helm feature at once.

Focus first on these concepts:

### 1. Chart

- a folder containing templates and metadata

### 2. Values

- the input configuration used by templates

### 3. Templates

- files that generate Kubernetes YAML

### 4. Release

- an installed instance of a chart

### 5. Upgrade cycle

- edit values or templates
- render
- lint
- upgrade

## Why Helm is useful in real projects

Helm is useful because it helps teams:

- avoid copying large YAML files everywhere
- reuse charts across environments
- pass different values for dev, staging, and production
- install apps consistently
- version application deployment logic

Example:

- same chart
- different values files
- different environments

## Suggested first commands to run now

If you want the best first session, run these in order:

```bash
helm version
helm create nginx-chart
helm template nginx-release nginx-chart
helm lint nginx-chart
helm install nginx-release nginx-chart
helm list
kubectl get all
helm uninstall nginx-release
```

## What success looks like

You are making progress when:

- you understand that Helm renders YAML
- you can create a chart without confusion
- you can install and uninstall a release
- you can explain the difference between a chart and a release
- you can change `values.yaml` and predict what will happen

## Best next step after this

After this first pass, the next useful exercise is:

1. create a Helm chart for your own learning app
2. replace hardcoded image, port, and replica values with `values.yaml`
3. render it with `helm template`
4. install it into Minikube
