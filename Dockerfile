FROM python:3.12-trixie

RUN DEBIAN_FRONTEND=noninteractive apt update

# internal container process management
RUN DEBIAN_FRONTEND=noninteractive apt install -y supervisor
# web server
RUN DEBIAN_FRONTEND=noninteractive apt install -y nginx
# sudo helper
RUN DEBIAN_FRONTEND=noninteractive apt install -y gosu

COPY docker/nginx.conf /etc/nginx/nginx.conf

COPY ./web-server/requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install -r /app/requirements.txt
COPY ./web-server /app
RUN rm -rf /app/.snowjam

COPY ./docker /app/docker
COPY ./script /app/script
COPY ./expo/dist /app/prod-frontend
RUN chmod -R 777 /app/script
RUN chmod -R 777 /app/docker
RUN mkdir /docker-entrypoint-initdb.d

ENTRYPOINT []

CMD ["/usr/bin/supervisord", "-c", "/app/docker/supervisord-full.conf"]