# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json /temp/dev/
RUN cd /temp/dev && bun install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
RUN apt-get update && apt-get install -y curl
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/dev/bun.lock .
COPY . .

# run the app
ENV NODE_ENV=development\
    PORT=3000

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start:dev" ]

RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM node:24.11.1-slim AS production

WORKDIR /usr/src/dist

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist .

ENV NODE_ENV=production\
    PORT=3001

EXPOSE 3001/tcp

CMD ["node", "main"]
