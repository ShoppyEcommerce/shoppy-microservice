# Use the official Nginx base image
FROM nginx:1.18.0

# Set the working directory to /app
WORKDIR /app

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Copy any additional configuration files or static assets
COPY public /app/public

# Expose port 80 to the outside world
EXPOSE 80

# Set the entry point for the container
ENTRYPOINT ["nginx", "-g", "daemon off;"]
