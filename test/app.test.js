const test = require("node:test");
const assert = require("node:assert/strict");

const { createRequestHandler, createServer } = require("../src/app");
const { DEFAULTS, loadConfig } = require("../src/config");

async function invokeRoute(config, url) {
  const requestHandler = createRequestHandler(config);
  const response = {
    statusCode: undefined,
    headers: undefined,
    body: undefined,
    writeHead(statusCode, headers) {
      this.statusCode = statusCode;
      this.headers = headers;
      return this;
    },
    end(body) {
      this.body = body;
      return this;
    },
  };

  await requestHandler({ url }, response);
  return response;
}

test("loadConfig returns expected defaults", () => {
  const config = loadConfig({});

  assert.equal(config.appName, DEFAULTS.appName);
  assert.equal(config.appEnv, DEFAULTS.appEnv);
  assert.equal(config.host, DEFAULTS.host);
  assert.equal(config.port, DEFAULTS.port);
  assert.equal(config.awsRegion, DEFAULTS.awsRegion);
  assert.equal(config.ecrRepository, DEFAULTS.ecrRepository);
});

test("loadConfig reads custom environment values", () => {
  const config = loadConfig({
    APP_NAME: "phase-one-demo",
    APP_ENV: "production",
    HOST: "0.0.0.0",
    PORT: "8080",
    AWS_REGION: "us-east-1",
    ECR_REPOSITORY: "phase-one-demo",
  });

  assert.equal(config.appName, "phase-one-demo");
  assert.equal(config.appEnv, "production");
  assert.equal(config.host, "0.0.0.0");
  assert.equal(config.port, 8080);
  assert.equal(config.awsRegion, "us-east-1");
  assert.equal(config.ecrRepository, "phase-one-demo");
});

test("loadConfig rejects invalid ports", () => {
  assert.throws(() => loadConfig({ PORT: "70000" }), /PORT must be an integer/);
});

test("createServer returns an HTTP server instance", () => {
  const server = createServer(loadConfig({}));

  assert.equal(typeof server.listen, "function");
  assert.equal(typeof server.close, "function");
});

test("GET /health returns service health metadata", async () => {
  const config = loadConfig({
    APP_NAME: "phase-one-demo",
    APP_ENV: "test",
    PORT: "3100",
    AWS_REGION: "us-east-1",
    ECR_REPOSITORY: "phase-one-demo",
  });

  const response = await invokeRoute(config, "/health");
  const payload = JSON.parse(response.body);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
  assert.equal(payload.ok, true);
  assert.equal(payload.service, "phase-one-demo");
  assert.equal(payload.environment, "test");
  assert.equal(payload.awsRegion, "us-east-1");
  assert.equal(payload.repository, "phase-one-demo");
  assert.ok(payload.hostname);
  assert.ok(payload.timestamp);
});

test("GET / returns app content", async () => {
  const config = loadConfig({ APP_ENV: "test" });
  const response = await invokeRoute(config, "/");

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["content-type"], "text/html; charset=utf-8");
  assert.match(response.body, /EC2 \+ ECR Learning App/);
  assert.match(response.body, /AWS Practice Repo/);
  assert.match(response.body, /"environment": "test"/);
});

test("unknown routes return a JSON 404 response", async () => {
  const config = loadConfig({});
  const response = await invokeRoute(config, "/missing");
  const payload = JSON.parse(response.body);

  assert.equal(response.statusCode, 404);
  assert.equal(payload.ok, false);
  assert.equal(payload.error, "Not Found");
});
