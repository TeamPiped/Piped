#!/bin/sh

if [ -z "$BACKEND_HOSTNAME" ]; then
    echo "BACKEND_HOSTNAME not set"
    exit 1
fi

sed -i s/pipedapi.kavin.rocks/"$BACKEND_HOSTNAME"/g /usr/share/nginx/html/assets/*
nginx -g "daemon off;"
