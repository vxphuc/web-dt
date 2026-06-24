FROM node:18-alpine

WORKDIR /app

# Cài đặt poppler-utils (dùng cho pdf2pic)
RUN apk add --no-cache poppler-utils

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
