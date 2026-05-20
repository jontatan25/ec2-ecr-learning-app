const http = require("node:http");
const os = require("node:os");

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

function renderHomePage() {
  const deployedAt = new Date().toISOString();
  const hostname = os.hostname();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EC2 + ECR Learning App</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5efe6;
        --panel: #fffaf2;
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
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(199, 91, 18, 0.16), transparent 30%),
          linear-gradient(135deg, #f8f2ea 0%, #efe4d3 100%);
        min-height: 100vh;
      }

      main {
        max-width: 880px;
        margin: 0 auto;
        padding: 48px 24px 72px;
      }

      .hero {
        background: rgba(255, 250, 242, 0.88);
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
        background: var(--panel);
      }

      .card strong {
        display: block;
        margin-bottom: 6px;
        font-size: 0.95rem;
      }

      code {
        color: var(--accent-dark);
        font-weight: 600;
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
          an EC2 instance.
        </p>

        <div class="grid">
          <article class="card">
            <strong>Container Port</strong>
            <span><code>${port}</code></span>
          </article>
          <article class="card">
            <strong>Hostname</strong>
            <span><code>${hostname}</code></span>
          </article>
          <article class="card">
            <strong>Rendered At</strong>
            <span><code>${deployedAt}</code></span>
          </article>
        </div>

        <div class="actions">
          <a class="primary" href="/health">Check health endpoint</a>
          <a class="secondary" href="https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html">Read ECR docs</a>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

const server = http.createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ok: true, service: "ec2-ecr-learning-app" }));
    return;
  }

  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(renderHomePage());
});

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
