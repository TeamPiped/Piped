FROM node:lts-alpine AS build

WORKDIR /app/

RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache \
    curl

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN --mount=type=cache,target=/root/.local/share/pnpm \
    --mount=type=cache,target=/app/node_modules \
    pnpm install --prefer-offline && \
    pnpm build && ./localizefonts.sh

FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY docker/entrypoint.sh /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
