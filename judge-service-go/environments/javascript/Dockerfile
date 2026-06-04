FROM node:20-alpine

# Install TypeScript and tsx
RUN npm install -g typescript tsx

# Create a non-root user 'judge'
RUN addgroup --system judge && adduser --system --ingroup judge judge

# Set the user
USER judge
