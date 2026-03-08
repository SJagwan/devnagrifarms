FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies (only production dependencies to keep image small)
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port (will be overridden by docker-compose)
EXPOSE 8080

# Command to run the app
CMD [ "npm", "start" ]