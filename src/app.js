const http = require("node:http");
const os = require("node:os");

function buildHealthPayload(config) {
  return {
    ok: true,
    service: config.appName,
    environment: config.appEnv,
    awsRegion: config.awsRegion,
    repository: config.ecrRepository,
    hostname: os.hostname(),
    timestamp: new Date().toISOString(),
  };
}

function renderHomePage(config) {
  const healthPayload = buildHealthPayload(config);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EC2 + ECR Learning App</title>
    <style>
      :root {
        color-scheme: light;
        --panel: rgba(255, 250, 242, 0.9);
        --ink: #1f1d1a;
        --muted: #5f574d;
        --accent: #c75b12;
        --accent-dark: #8a3b08;
        --border: #e9dbc8;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(199, 91, 18, 0.16), transparent 30%),
          linear-gradient(135deg, #f8f2ea 0%, #efe4d3 100%);
      }

      main {
        max-width: 920px;
        margin: 0 auto;
        padding: 48px 24px 72px;
      }

      .hero {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 28px;
        padding: 36px;
        box-shadow: 0 20px 60px rgba(58, 39, 14, 0.1);
        backdrop-filter: blur(10px);
      }

      .eyebrow {
        display: inline-block;
        margin-bottom: 14px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(199, 91, 18, 0.12);
        color: var(--accent-dark);
        font-size: 0.85rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(2.4rem, 5vw, 4.5rem);
        line-height: 0.95;
      }

      p {
        margin: 0;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.7;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-top: 28px;
      }

      .card {
        padding: 18px;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: #fffaf2;
      }

      .card strong {
        display: block;
        margin-bottom: 6px;
        font-size: 0.95rem;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
      }

      a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 18px;
        border-radius: 999px;
        text-decoration: none;
        font-weight: 600;
      }

      .primary {
        background: var(--accent);
        color: white;
      }

      .secondary {
        border: 1px solid var(--border);
        color: var(--ink);
        background: rgba(255, 255, 255, 0.72);
      }

      pre {
        margin: 28px 0 0;
        padding: 18px;
        overflow-x: auto;
        border-radius: 18px;
        background: #211910;
        color: #f7e8d5;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <span class="eyebrow">AWS Practice Repo</span>
        <h1>EC2 + ECR Learning App</h1>
        <p>
          This tiny Node.js app is intentionally simple so we can focus on the
          AWS workflow: build a container, push it to Amazon ECR, and run it on
          an EC2 instance with clean configuration and health checks.
        </p>

        <div class="grid">
          <article class="card">
            <strong>Environment</strong>
            <span>${config.appEnv}</span>
          </article>
          <article class="card">
            <strong>Listening On</strong>
            <span>${config.host}:${config.port}</span>
          </article>
          <article class="card">
            <strong>AWS Region</strong>
            <span>${config.awsRegion}</span>
          </article>
          <article class="card">
            <strong>ECR Repository</strong>
            <span>${config.ecrRepository}</span>
          </article>
        </div>

        <div class="actions">
          <a class="primary" href="/health">Check health endpoint</a>
          <a class="secondary" href="https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html">Read ECR docs</a>
        </div>

        <pre>${JSON.stringify(healthPayload, null, 2)}</pre>
      </section>
    </main>
  </body>
</html>`;
}

function createRequestHandler(config) {
  return (request, response) => {
    if (request.url === "/health") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(JSON.stringify(buildHealthPayload(config)));
      return;
    }

    if (request.url === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(renderHomePage(config));
      return;
    }

    response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: false, error: "Not Found" }));
  };
}

function createServer(config) {
  return http.createServer(createRequestHandler(config));
}

module.exports = {
  buildHealthPayload,
  createRequestHandler,
  createServer,
  renderHomePage,
};
