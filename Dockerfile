# ==========================================
# Stage 1: Build Stage (Node.js Base Image)
# ==========================================
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package management files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code and build the Next.js production bundle
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Final Stage (Production Image)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production

# Copy built application assets and dependencies from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# Copy public folder only if it exists (using wildcard to prevent build failure)
COPY --from=builder /app/public* ./public

# Expose Next.js default port
EXPOSE 3000

# Start the production Next.js server
CMD ["npm", "start"]