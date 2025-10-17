# Stage 1: Build React app
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY ../nginx/nginx.conf /etc/nginx/nginx.conf
COPY ../nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ../nginx/ssl /etc/nginx/ssl

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
