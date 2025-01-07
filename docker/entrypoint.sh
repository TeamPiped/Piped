#!/bin/sh

if [ -z "$BACKEND_HOSTNAME" ]; then
    echo "BACKEND_HOSTNAME not set"
    exit 1
fi

HTTP_MODE=${HTTP_MODE:-https}

sed -i s@https://pipedapi.kavin.rocks@"$HTTP_MODE"://pipedapi.kavin.rocks@g /usr/share/nginx/html/assets/*
sed -i s/pipedapi.kavin.rocks/"$BACKEND_HOSTNAME"/g /usr/share/nginx/html/assets/*
nginx -g "daemon off;"
