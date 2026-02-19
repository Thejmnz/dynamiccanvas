FROM node:20-slim AS base

ENV NODE_OPTIONS="--dns-result-order=ipv4first"
ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies and base fonts
# fonts-liberation covers: Arial, Arial Black, Verdana, Helvetica, Times New Roman, Courier New, Impact
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    fonts-freefont-ttf \
    fonts-noto \
    fonts-noto-extra \
    fonts-roboto \
    fonts-lato \
    fonts-open-sans \
    fontconfig \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download ALL fonts from editor list
# Verified URLs - all return 302 Found
RUN mkdir -p /usr/share/fonts/truetype/google-fonts && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/comicneue/ComicNeue-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/ComicNeue-Regular.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/comicneue/ComicNeue-Bold.ttf" -o "/usr/share/fonts/truetype/google-fonts/ComicNeue-Bold.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/PlayfairDisplay.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay-Italic%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/PlayfairDisplay-Italic.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/DancingScript.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/merriweather/Merriweather%5Bopsz%2Cwdth%2Cwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/Merriweather.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/EBGaramond.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/crimsonpro/CrimsonPro%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/CrimsonPro.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/apache/robotoslab/RobotoSlab%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/RobotoSlab.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/ptmono/PTM55FT.ttf" -o "/usr/share/fonts/truetype/google-fonts/PTMono.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/spectral/Spectral-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Spectral-Regular.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/spectral/Spectral-Bold.ttf" -o "/usr/share/fonts/truetype/google-fonts/Spectral-Bold.ttf" && \
    fc-cache -f -v

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

FROM base AS deps
WORKDIR /app
COPY --from=base /app/package.json /app/yarn.lock* /app/package-lock.json* /app/pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

RUN npm rebuild canvas --build-from-source

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

# Install runtime fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    fonts-freefont-ttf \
    fonts-noto \
    fonts-noto-extra \
    fonts-roboto \
    fonts-lato \
    fonts-open-sans \
    fontconfig \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download ALL fonts - same as base
RUN mkdir -p /usr/share/fonts/truetype/google-fonts && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/comicneue/ComicNeue-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/ComicNeue-Regular.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/comicneue/ComicNeue-Bold.ttf" -o "/usr/share/fonts/truetype/google-fonts/ComicNeue-Bold.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/PlayfairDisplay.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay-Italic%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/PlayfairDisplay-Italic.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/DancingScript.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/merriweather/Merriweather%5Bopsz%2Cwdth%2Cwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/Merriweather.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/EBGaramond.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/crimsonpro/CrimsonPro%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/CrimsonPro.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/apache/robotoslab/RobotoSlab%5Bwght%5D.ttf" -o "/usr/share/fonts/truetype/google-fonts/RobotoSlab.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/ptmono/PTM55FT.ttf" -o "/usr/share/fonts/truetype/google-fonts/PTMono.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/spectral/Spectral-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Spectral-Regular.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/spectral/Spectral-Bold.ttf" -o "/usr/share/fonts/truetype/google-fonts/Spectral-Bold.ttf" && \
    fc-cache -f -v

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3111

ENV PORT=3111

CMD ["node", "server.js"]
