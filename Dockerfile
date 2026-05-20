FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV APP_NAME=ec2-ecr-learning-app
ENV APP_ENV=production
ENV AWS_REGION=eu-west-1
ENV ECR_REPOSITORY=ec2-ecr-learning-app
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

RUN chown -R node:node /app
USER node

CMD ["npm", "start"]
