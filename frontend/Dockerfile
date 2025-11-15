# Stage 1: Build React app
FROM node:18 AS build
WORKDIR /app

# Copy package.json & package-lock.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code & environment file
COPY . .
COPY .env .env

# Build React app (creates /app/build)
RUN npm run build

# Stage 2: Serve React build with Nginx
FROM nginx:alpine

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]