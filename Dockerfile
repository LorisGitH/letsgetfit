# The built PWA on an unprivileged nginx: runs as user 101 on port 8080, so the Pod passes
# Kubernetes Pod Security `restricted` (see ADR 0002). Build dist/ first with `pnpm build`;
# .dockerignore sends only dist/ and the nginx config.
# https://github.com/nginx/docker-nginx-unprivileged#readme
# 1.31.7-alpine is published for arm64 (Docker Hub tag API, checked 2026-11-17).
FROM docker.io/nginxinc/nginx-unprivileged:1.31.7-alpine

# Links the GHCR package to this repository.
LABEL org.opencontainers.image.source="https://github.com/LorisGitH/letsgetfit"
LABEL org.opencontainers.image.licenses="PolyForm-Noncommercial-1.0.0"

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
