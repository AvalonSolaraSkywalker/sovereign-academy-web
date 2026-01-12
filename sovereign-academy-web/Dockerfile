FROM node:20-alpine AS regen-lock
WORKDIR /app
RUN npm i -g pnpm@10.28.0
COPY package.json ./
# Generate a fresh lockfile (no --frozen-lockfile)
RUN pnpm install --lockfile-only

FROM node:20-alpine AS builder
WORKDIR /app
RUN npm i -g pnpm@10.28.0
# Copy the freshly generated lockfile from the previous stage
COPY --from=regen-lock /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY package.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm","start"]