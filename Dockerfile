# syntax=docker/dockerfile:1.6

# Multi-stage build:
# 1) Build React app with Vite (optionally run Vitest)
# 2) Build a minimal PocketBase runtime and embed static files in /pb/pb_public

########## 1) Frontend build stage ##########
FROM node:20-alpine AS web
WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install --no-audit --no-fund

# Copy sources
COPY . .

# Allow passing Vite envs at build time
ARG VITE_POCKETDB_URL
ARG VITE_BASE=/
ARG SKIP_TESTS=false
ENV VITE_POCKETDB_URL=${VITE_POCKETDB_URL}
ENV VITE_BASE=${VITE_BASE}

# Optionally run tests (Vitest) during build
RUN if [ "$SKIP_TESTS" != "true" ]; then npm run test:run; fi

# Build static assets
RUN npm run build

########## 2) PocketBase runtime stage ##########
FROM alpine:3.19 AS runtime

ARG PB_VERSION=0.22.14
ARG PB_ARCH=linux_amd64

RUN apk add --no-cache ca-certificates wget unzip \
  && adduser -D -h /pb -s /sbin/nologin pb \
  && mkdir -p /pb/pb_data /pb/pb_public \
  && chown -R pb:pb /pb

WORKDIR /pb

# Download PocketBase release and install
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PB_ARCH}.zip -O /tmp/pb.zip \
  && unzip -q /tmp/pb.zip -d /pb \
  && chmod +x /pb/pocketbase \
  && rm /tmp/pb.zip

# Embed the built frontend into PocketBase public dir
COPY --from=web /app/dist /pb/pb_public
COPY pb_migrations /pb/pb_migrations

EXPOSE 8090
VOLUME ["/pb/pb_data"]

# Basic healthcheck against the built-in health endpoint
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8090/api/health || exit 1

USER pb

ENTRYPOINT ["/pb/pocketbase"]
CMD ["serve", "--http=0.0.0.0:8090"]
