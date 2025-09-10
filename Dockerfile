# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# تثبيت الـ dependencies
COPY package*.json ./
RUN npm install

# نسخ باقي الملفات وبناء المشروع
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# نسخ ملف إعداد Nginx افتراضي لتشغيل SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
