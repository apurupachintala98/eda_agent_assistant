# Use a compatible Node.js version
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm@11
RUN npm install -g npm@11.0.0

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the app's port
EXPOSE 5000

# Run the application
CMD ["npm", "start"]
