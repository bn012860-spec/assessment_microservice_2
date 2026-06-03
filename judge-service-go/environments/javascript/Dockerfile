FROM node:20-alpine

# Install TypeScript and ts-node
RUN npm install -g typescript ts-node

# Create a non-root user 'judge'
RUN addgroup --system judge && adduser --system --ingroup judge judge

# Set the user
USER judge
