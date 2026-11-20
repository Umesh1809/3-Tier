# Build React assets
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve static files with an unprivileged Nginx worker.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN mkdir -p /tmp/client_temp && chown 101:101 /tmp/client_temp
USER 101:101
EXPOSE 8080
CMD ["nginx", "-g", "daemon off; pid /tmp/nginx.pid;"]
