FROM oven/bun AS build
WORKDIR /app

COPY bun.lockb .
COPY package.json .

ENV NODE_ENV=production
RUN bun install --frozen-lockfile

COPY tsconfig.json .
COPY src ./src

RUN bun build ./src/index.ts --compile --outfile cli

FROM ubuntu:22.04
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/cli /app/cli

CMD ["/app/cli"]
