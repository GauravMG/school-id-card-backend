# Switch from Alpine (musl libc) to Debian slim (glibc) so that prebuilt native
# binaries for onnxruntime-node (@imgly background removal) load correctly.
FROM node:22-slim

WORKDIR /app

# ── System packages ─────────────────────────────────────────────────────────
# openssl            — Prisma
# python3/make/g++   — node-gyp fallback for native addons
# libasound2t64      — libasound.so.2 for Chrome (renamed from libasound2 in Bookworm)
# remaining libs     — chrome-headless-shell runtime deps (Puppeteer)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    python3 \
    make \
    g++ \
    ca-certificates \
    fonts-liberation \
    # libasound2t64 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc-s1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
