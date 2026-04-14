# Giai đoạn 1: Cài đặt và Build code ra thư mục 'dist'
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Chạy lệnh build của Vite
RUN npm run build

# Giai đoạn 2: Đưa vào Nginx để chạy trên môi trường thực tế
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# Copy thư mục 'dist' của Vite vào Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]