FROM node:18-alpine

WORKDIR /app

# pdf2pic cần GraphicsMagick và Ghostscript để đọc, render PDF.
RUN apk add --no-cache graphicsmagick ghostscript poppler-utils

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
