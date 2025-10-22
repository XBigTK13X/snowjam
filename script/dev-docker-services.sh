#! /bin/bash

echo "Docker services working dir"

pwd

docker pull $SNOWJAM_DOCKER_IMAGE

docker rm -f snowjam || true

# Ports
# 8000  - snowjam
# 80    - nginx
# 9001  - supervisord gui

docker run -d \
    -e RABBITMQ_LOGS=- \
    -e SNOWJAM_LOG_FILE_PATH=/app/logs/snowjam.log \
    --name snowjam \
    -p 9060:5432 \
    -p 9061:15672 \
    -p 9062:5672 \
    -p 9063:8000 \
    -p 9064:80 \
    -p 9065:9001 \
    -p 9066:1984 \
    -p 9067:9067 \
    -v $(pwd)/.docker-volume/logs:/app/logs \
    -v $(pwd)/web-server/.snowjam:/mnt/.snowjam \
    -v /mnt/j-media/snowjam:/mnt/j-media/snowjam \
    $SNOWJAM_DOCKER_IMAGE

sleep 12

if [ -z "$1" ]; then
    script/db-migrate.sh
fi