FROM node:lts-alpine AS build

WORKDIR /app/

COPY . .

RUN --mount=type=cache,target=/root/.cache/yarn \
    --mount=type=cache,target=/app/node_modules \
    pkg add curl && \
    yarn install --prefer-offline && \
    yarn build && ./localizefonts.sh

FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
