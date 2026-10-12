# Base image with whisper-cli, ffmpeg and the RNNoise model (see Dockerfile.base).
# Override to use a multi-arch build, e.g. ghcr.io/<owner>/sendrec-base:latest.
ARG BASE_IMAGE=alexneamtu/sendrec-base:latest

# Stage 1: Build frontend (platform-independent output, always built natively)
FROM --platform=$BUILDPLATFORM node:24-alpine AS frontend
ENV PNPM_CONFIG_STRICT_DEP_BUILDS=false
WORKDIR /app/web
COPY web/package.json web/pnpm-lock.yaml* ./
# Pin pnpm to the CI version; unpinned corepack pulls the latest major.
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate && pnpm install --frozen-lockfile
COPY web/ .
RUN pnpm build

# Stage 2: Build Go binary (cross-compiled natively for the target platform)
FROM --platform=$BUILDPLATFORM golang:1.26.5-alpine AS backend
ARG TARGETOS
ARG TARGETARCH
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend /app/web/dist ./web/dist
ARG VERSION=dev
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -ldflags="-s -w -X main.version=${VERSION}" -o sendrec ./cmd/sendrec

# Stage 3: Final image (base includes whisper-cli, ffmpeg, RNNoise model)
FROM ${BASE_IMAGE}
COPY --from=backend /app/sendrec .
COPY docker-entrypoint.sh .
USER sendrec
EXPOSE 8080
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["./sendrec"]
