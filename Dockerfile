# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Disable Husky
ENV HUSKY=0

# Install pnpm matching project requirements
RUN npm install -g pnpm@11.8.0

# Copy package definitions
COPY package.json pnpm-lock.yaml ./

# Remove prepare script (husky) and install dependencies skipping lifecycle scripts
RUN npm pkg delete scripts.prepare && \
    pnpm install --frozen-lockfile --ignore-scripts

# Copy project source code
COPY . .

# Build argument for backend API URL (embedded at build time by Vite)
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}

# Build production bundle
RUN pnpm run build

# Stage 2: Production server with Nginx
FROM nginx:alpine AS runner

# Clean default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
