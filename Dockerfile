FROM node:20-slim

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm install --legacy-peer-deps

# Copy source just in case, though volumes will override
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000
ENV PORT 3000

# Start seed in background (will wait for server) then start dev server
CMD ["npm", "run", "dev"]
