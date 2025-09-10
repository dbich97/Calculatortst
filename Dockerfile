# ---- Build Stage ----
FROM node:18-bullseye AS build

WORKDIR /app

# نسخ ملفات package.json و package-lock.json
COPY package*.json ./

# تثبيت الـ dependencies
RUN npm install

# نسخ باقي الملفات وبناء المشروع
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM nginx:1.27-bullseye

# نسخ ملفات البناء إلى مجلد Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# إعداد Nginx لتطبيق SPA
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
