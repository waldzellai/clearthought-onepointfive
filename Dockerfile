FROM node:18-alpine

# Install curl for health check
RUN apk add --no-cache curl

# Create app directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies (skip prepare script)
RUN npm ci --ignore-scripts

# No longer needed - using standard MCP SDK patterns

# Copy source files
COPY . .

# Build the project
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Set executable permissions
RUN chmod +x build/index.js

# Expose port
EXPOSE 3000

# Run as non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the HTTP server
CMD ["node", "build/src/smithery-entry.js"]

# Label the image
LABEL org.opencontainers.image.source="https://github.com/waldzellai/waldzell-mcp/tree/main/servers/server-clear-thought"
LABEL org.opencontainers.image.description="MCP server for systematic thinking, mental models, debugging approaches, and memory management"
LABEL org.opencontainers.image.licenses="MIT"
