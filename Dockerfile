# ---- client build ----
FROM node:24-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- server ----
FROM node:24-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
# game art served at /assets
COPY assets/ /app/assets/
# built SPA served by express
COPY --from=client-build /app/client/dist ./public
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/family.db
VOLUME /app/data
EXPOSE 3001
CMD ["node", "src/index.js"]
