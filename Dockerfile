FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run as non-root user
USER node

# Start the application
CMD ["node", "server.js"]