ARG NODE_VERSION=26.12

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm ci

FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY . .
RUN npm run build

FROM deps AS dev
COPY . .
ENV PORT=3001
EXPOSE ${PORT}
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]

FROM node:${NODE_VERSION}-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
RUN mkdir -p .next/cache && chown 1000:1000 .next/cache
USER 1000:1000
ENV HOSTNAME=0.0.0.0
ENV PORT=3001
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/api/health').then(r=>process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]