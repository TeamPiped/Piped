#!/bin/sh

HTTP_MODE=${HTTP_MODE:-https}

if [ -n "${BACKEND_HOSTNAME}" ]; then
    # New BYOD approach: inject runtime config into index.html
    sed -i "s|__PIPED_API_URL__|${HTTP_MODE}://${BACKEND_HOSTNAME}|g" /usr/share/nginx/html/index.html

    # Legacy: also replace in bundled assets for backwards compatibility
    sed -i "s@https://pipedapi.kavin.rocks@${HTTP_MODE}://${BACKEND_HOSTNAME}@g" /usr/share/nginx/html/assets/* 2>/dev/null || true
fi
# If BACKEND_HOSTNAME is unset, the frontend defaults to window.location.origin (BYOD mode)

if [ -n "${HTTP_WORKERS}" ]; then
    sed -i "s/worker_processes  auto;/worker_processes  ${HTTP_WORKERS};/g" /etc/nginx/nginx.conf
fi

if [ -n "${HTTP_PORT}" ]; then
    sed -i "s/80;/${HTTP_PORT};/g" /etc/nginx/conf.d/default.conf
fi

nginx -g "daemon off;"
