FROM node:20-slim AS base

# Install dependencies only when needed
ENV NODE_OPTIONS="--dns-result-order=ipv4first"
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime and build dependencies
# We use a single layer to keep it clean.
# These libraries are needed for canvas/fabric to work correctly.
# Also installing fonts for server-side rendering
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
    && rm -rf /var/lib/apt/lists/*

# Download and install Playfair Display from Google Fonts
RUN mkdir -p /usr/share/fonts/truetype/google-fonts && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Regular.ttf" -o /usr/share/fonts/truetype/google-fonts/PlayfairDisplay-Regular.ttf && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Bold.ttf" -o /usr/share/fonts/truetype/google-fonts/PlayfairDisplay-Bold.ttf && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Italic.ttf" -o /usr/share/fonts/truetype/google-fonts/PlayfairDisplay-Italic.ttf && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-BoldItalic.ttf" -o /usr/share/fonts/truetype/google-fonts/PlayfairDisplay-BoldItalic.ttf && \
    fc-cache -f -v

WORKDIR /app

# Install dependencies based on the preferred package manager
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

# Rebuild canvas to ensure it links against the system libraries we installed
RUN npm rebuild canvas --build-from-source

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

# Install runtime fonts for the production image (since base is used for building)
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
    && rm -rf /var/lib/apt/lists/*

# Download and install Playfair Display from Google Fonts
RUN mkdir -p /usr/share/fonts/truetype/google-fonts && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Regular.ttf" -o /usr/share/fonts/truetype/google-fonts/PlayfairDisplay-Regular.ttf && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Bold.ttf" -o /usr/share/fonts/truetype/google-fonts/PlayfairDisplay-Bold.ttf && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Italic.ttf" -o /usr/share/fonts/truetype/google-fonts/PlayfairDisplay-Italic.ttf && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-BoldItalic.ttf" -o /usr/share/fonts/truetype/google-fonts/PlayfairDisplay-BoldItalic.ttf && \
    fc-cache -f -v

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3111

ENV PORT=3111

CMD ["node", "server.js"]
