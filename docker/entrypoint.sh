#!/bin/sh

if [ -z "${BACKEND_HOSTNAME}" ]; then
    echo "BACKEND_HOSTNAME not set"
    exit 1
fi

HTTP_MODE=${HTTP_MODE:-https}

sed -i "s@https://pipedapi.kavin.rocks@${HTTP_MODE}://pipedapi.kavin.rocks@g" /usr/share/nginx/html/assets/*
sed -i "s/pipedapi.kavin.rocks/${BACKEND_HOSTNAME}/g" /usr/share/nginx/html/assets/*

if [ -n "${HTTP_WORKERS}" ]; then
    sed -i "s/worker_processes  auto;/worker_processes  ${HTTP_WORKERS};/g" /etc/nginx/nginx.conf
fi

if [ -n "${HTTP_PORT}" ]; then
    sed -i "s/80;/${HTTP_PORT};/g" /etc/nginx/conf.d/default.conf
fi

nginx -g "daemon off;"
