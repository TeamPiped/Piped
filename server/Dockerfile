FROM node:22-alpine

# Install Python (for yt-dlp), ffmpeg (for merging streams), and curl
RUN apk add --no-cache python3 py3-pip ffmpeg curl && \
    # Install yt-dlp via pip so it auto-updates correctly
    pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY index.js .

ENV PORT=3000
EXPOSE 3000

# Run as non-root user
RUN addgroup -S proxy && adduser -S proxy -G proxy
USER proxy

CMD ["node", "index.js"]
