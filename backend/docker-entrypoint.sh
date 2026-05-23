#!/bin/sh
set -e

# Render/Heroku-style DATABASE_URL conversion:
# Input:  postgres://user:pass@host:port/db OR postgresql://user:pass@host:port/db
# Output: jdbc:postgresql://host:port/db with user/pass split out for Spring.
RAW_URL="${SPRING_DATASOURCE_URL:-${DATABASE_URL:-}}"

if [ -n "$RAW_URL" ] && ! echo "$RAW_URL" | grep -q "^jdbc:"; then
  CREDS_PART=$(echo "$RAW_URL" | sed -E 's|^postgres(ql)?://([^@]*)@.*$|\2|')
  HOST_PART=$(echo "$RAW_URL" | sed -E 's|^postgres(ql)?://[^@]*@(.*)$|\2|')

  DB_USER_FROM_URL=$(echo "$CREDS_PART" | cut -d: -f1)
  DB_PASS_FROM_URL=$(echo "$CREDS_PART" | cut -d: -f2-)

  export SPRING_DATASOURCE_URL="jdbc:postgresql://${HOST_PART}"

  if [ -z "${SPRING_DATASOURCE_USERNAME:-}" ] && [ -z "${DB_USER:-}" ]; then
    export SPRING_DATASOURCE_USERNAME="$DB_USER_FROM_URL"
  fi
  if [ -z "${SPRING_DATASOURCE_PASSWORD:-}" ] && [ -z "${DB_PASSWORD:-}" ]; then
    export SPRING_DATASOURCE_PASSWORD="$DB_PASS_FROM_URL"
  fi

  echo "[entrypoint] Normalized DATABASE_URL -> $SPRING_DATASOURCE_URL"
fi

exec java $JAVA_OPTS -Dserver.port="${PORT:-8080}" -jar /app/app.jar
