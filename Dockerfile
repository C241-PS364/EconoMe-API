# Use an official Node.js 20 runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Download the Cloud SQL Auth proxy
ADD https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 /cloud_sql_proxy
RUN chmod +x /cloud_sql_proxy

# Expose the port the app runs on
EXPOSE 8080

# Start the Cloud SQL Auth proxy and the application
CMD ["sh", "-c", "/cloud_sql_proxy -dir=/cloudsql -instances=$INSTANCE_CONNECTION_NAME=tcp:5432 & npm start"]
