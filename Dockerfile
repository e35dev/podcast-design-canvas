# Web: Next.js frontend + API.
FROM node:22-slim AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npx prisma generate && npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
