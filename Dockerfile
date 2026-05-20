FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV APP_NAME=simple-app
ENV APP_ENV=production
ENV AWS_REGION=eu-north-1
ENV ECR_REPOSITORY=simple-app
ENV HOST=0.0.0.0
ENV PORT=4000

EXPOSE 4000

RUN chown -R node:node /app
USER node

CMD ["npm", "start"]
