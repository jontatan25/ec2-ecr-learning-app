const DEFAULTS = {
  appName: "ec2-ecr-learning-app",
  appEnv: "development",
  host: "127.0.0.1",
  port: 3000,
  awsRegion: "eu-west-1",
  ecrRepository: "ec2-ecr-learning-app",
};

function readPort(rawPort) {
  if (rawPort === undefined || rawPort === "") {
    return DEFAULTS.port;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return parsedPort;
}

function loadConfig(env = process.env) {
  return {
    appName: env.APP_NAME || DEFAULTS.appName,
    appEnv: env.APP_ENV || DEFAULTS.appEnv,
    host: env.HOST || DEFAULTS.host,
    port: readPort(env.PORT),
    awsRegion: env.AWS_REGION || DEFAULTS.awsRegion,
    ecrRepository: env.ECR_REPOSITORY || DEFAULTS.ecrRepository,
  };
}

module.exports = {
  DEFAULTS,
  loadConfig,
};
