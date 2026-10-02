# --- 1. Build du frontend (Vite) ---
FROM node:24-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend ./
ARG VITE_GIT_REF
ENV VITE_GIT_REF=$VITE_GIT_REF
RUN npm run build

# --- 2. Dépendances de production du backend ---
FROM node:24-slim AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# --- 3. Image d'exécution : backend + front compilé (Express sert aussi le front) ---
FROM node:24-slim
ENV NODE_ENV=production PORT=8000
WORKDIR /app/backend
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist
USER node
EXPOSE 8000
# Pas de curl dans l'image slim : healthcheck via fetch de Node
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:' + (process.env.PORT || 8000)).then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "server.js"]
