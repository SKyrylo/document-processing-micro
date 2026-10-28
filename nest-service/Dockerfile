ARG NODE_VERSION=26.12

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM deps AS dev
COPY . .
ENV PORT=3000
EXPOSE ${PORT}
CMD ["npm", "run", "start:dev"]

FROM node:${NODE_VERSION}-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER 1000:1000
ENV PORT=3000
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/health').then(r=>process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/src/main.js"]
