
FROM oven/bun:1.3.2 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --production

COPY . .

RUN bun build src/index.ts --outdir dist --minify --target bun

FROM oven/bun:1.3.2 AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "dist/index.js"]
