FROM node:20

WORKDIR /app

# --- 1. Copie & installation du backend ---
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# --- 2. Copie des sources backend ---
COPY backend ./backend/

# --- 3. Copie & build du frontend ---
ARG VITE_GIT_REF
ENV VITE_GIT_REF=$VITE_GIT_REF
COPY frontend ./frontend/
RUN cd frontend && npm install && npm run build

# --- 4. Point de départ (Express sert aussi le front) ---
WORKDIR /app/backend
ENV PORT=8000
CMD ["node", "server.js"]