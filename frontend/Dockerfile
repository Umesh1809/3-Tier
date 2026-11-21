# Build React assets
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve static files with an unprivileged Nginx worker.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Runtime deployments provide Nginx configuration through Compose or a Kubernetes ConfigMap.
RUN sed -i 's|^[[:space:]]*pid[[:space:]].*;|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf \
    && mkdir -p /tmp/client_temp /var/cache/nginx \
    && chown 101:101 /tmp/client_temp \
    && chown -R 101:101 /var/cache/nginx
USER 101:101
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
