# Use node to build the Vite app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Serve both API and Frontend with Node.js
FROM node:20-alpine
WORKDIR /app

# Only install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built frontend
COPY --from=builder /app/dist ./dist
# Copy backend
COPY --from=builder /app/server ./server

# Fallback env file if any
COPY --from=builder /app/.env* ./

EXPOSE 3001
CMD ["npm", "run", "server"]
