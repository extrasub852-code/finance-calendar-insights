# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim

WORKDIR /app

# Install without lifecycle scripts so `postinstall` / prisma does not run until
# the full tree (including prisma/schema.prisma) is present — avoids Railpack/Docker
# install-order failures.
COPY package.json package-lock.json ./
RUN npm ci --include=dev --ignore-scripts

COPY . .

RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production

CMD ["npm", "start"]
