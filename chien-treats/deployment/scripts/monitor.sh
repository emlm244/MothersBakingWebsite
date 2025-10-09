#!/bin/bash
# Simple monitoring script for Chien's Treats
# Run via cron: */5 * * * * /usr/local/bin/chienstreats-monitor

SITE="chienstreats"
API_URL="http://localhost:4000/healthz"
FRONTEND_URL="http://localhost:3101/"
LOG="/srv/sites/$SITE/shared/logs/monitor.log"

check_service() {
    local name=$1
    local url=$2
    
    if curl -f -s -m 5 "$url" > /dev/null 2>&1; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - $name: OK" >> "$LOG"
        return 0
    else
        echo "$(date '+%Y-%m-%d %H:%M:%S') - $name: FAILED" >> "$LOG"
        systemctl restart $SITE-$(echo $name | tr '[:upper:]' '[:lower:]')
        return 1
    fi
}

check_service "API" "$API_URL"
check_service "Frontend" "$FRONTEND_URL"

# Rotate log if > 10MB
if [ -f "$LOG" ] && [ $(stat -f%z "$LOG" 2>/dev/null || stat -c%s "$LOG") -gt 10485760 ]; then
    mv "$LOG" "$LOG.old"
    gzip "$LOG.old"
fi
