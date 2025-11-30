FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Install Node.js and npm
ARG NODE_VERSION=20
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g npm@latest && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspaces/vibesapp

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web-v2/package*.json ./apps/web-v2/
COPY libs/shared/package*.json ./libs/shared/
COPY libs/contracts/package*.json ./libs/contracts/
COPY libs/e2e-testing/package*.json ./libs/e2e-testing/

# Install dependencies at root level
# This will trigger postinstall hooks for apps/api and apps/web-v2
RUN npm ci --omit=dev

# Prebuild additional layers - installing devDependencies for faster builds
RUN npm ci

# Copy the rest of the source code
COPY . .

# Create non-root user (node already exists from base image)
USER node

# Set environment variables
ENV NODE_ENV=development \
    PORT=5001 \
    VITE_PORT=5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD npm --version && node --version || exit 1

EXPOSE 5173 5001
