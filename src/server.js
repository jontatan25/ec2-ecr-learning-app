const { createServer } = require("./app");
const { loadConfig } = require("./config");

function startServer(env = process.env) {
  const config = loadConfig(env);
  const server = createServer(config);

  server.listen(config.port, config.host, () => {
    console.log(`Server listening on http://${config.host}:${config.port}`);
  });

  return { config, server };
}

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
};
