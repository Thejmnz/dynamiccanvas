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
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download and install ALL fonts from editor list from Google Fonts
# Some fonts are covered by fonts-liberation (Arial, Verdana, Helvetica, Times New Roman, Courier New, Impact)
# Others need to be downloaded
RUN mkdir -p /usr/share/fonts/truetype/google-fonts && \
    curl -L "https://github.com/google/fonts/raw/main/apache/robotoslab/RobotoSlab-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Trebuchet MS.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/merriweather/Merriweather-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Georgia.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Garamond.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Brush Script MT.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/crimsonpro/CrimsonPro-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Palatino.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/bookmanoldstyle/BookmanOldStyle-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Bookman.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/comicneue/ComicNeue-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Comic Sans MS.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/ptmono/PTMono-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Lucida Console.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Playfair Display.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Bold.ttf" -o "/usr/share/fonts/truetype/google-fonts/Playfair Display Bold.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Italic.ttf" -o "/usr/share/fonts/truetype/google-fonts/Playfair Display Italic.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-BoldItalic.ttf" -o "/usr/share/fonts/truetype/google-fonts/Playfair Display Bold Italic.ttf" && \
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
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"

# Install runtime dependencies and fonts for production
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

# Download and install ALL fonts from editor list
RUN mkdir -p /usr/share/fonts/truetype/google-fonts && \
    curl -L "https://github.com/google/fonts/raw/main/apache/robotoslab/RobotoSlab-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Trebuchet MS.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/merriweather/Merriweather-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Georgia.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Garamond.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Brush Script MT.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/crimsonpro/CrimsonPro-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Palatino.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/bookmanoldstyle/BookmanOldStyle-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Bookman.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/comicneue/ComicNeue-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Comic Sans MS.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/ptmono/PTMono-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Lucida Console.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Regular.ttf" -o "/usr/share/fonts/truetype/google-fonts/Playfair Display.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Bold.ttf" -o "/usr/share/fonts/truetype/google-fonts/Playfair Display Bold.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-Italic.ttf" -o "/usr/share/fonts/truetype/google-fonts/Playfair Display Italic.ttf" && \
    curl -L "https://github.com/google/fonts/raw/main/ofl/playfairdisplaystatic/PlayfairDisplay-BoldItalic.ttf" -o "/usr/share/fonts/truetype/google-fonts/Playfair Display Bold Italic.ttf" && \
    fc-cache -f -v

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder including fonts
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

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
