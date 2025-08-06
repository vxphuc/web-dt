FROM node:18

# Cài đặt nodemon toàn cục để dùng được trong container
RUN npm install -g nodemon

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và cài đặt package
COPY package*.json ./
RUN npm install

# Copy toàn bộ project
COPY . .

# Expose port mặc định (nếu app chạy ở 3000)
EXPOSE 3000

# Lệnh khởi chạy app
CMD ["npm", "start"]
