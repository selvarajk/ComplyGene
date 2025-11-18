# Use a small official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the source code
COPY . .

# Environment
ENV NODE_ENV=production
# Render will set PORT, but let's default to 4000
ENV PORT=4000

# Expose the port (for documentation; Render still uses $PORT)
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
