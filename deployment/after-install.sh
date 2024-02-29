#!/bin/bash
set -euo pipefail

# enable and start docker service
systemctl enable docker.service
systemctl start docker.service

# login to ecr
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 163482350712.dkr.ecr.eu-west-1.amazonaws.com

# read docker image version from manifest
DOCKER_IMAGE=$(cat "/home/ec2-user/unguess-api/docker-image.txt")
DOCKER_COMPOSE_FILE="/home/ec2-user/$APPLICATION_NAME/docker-compose.yml"
INSTANCE_ID=$(wget -q -O - http://169.254.169.254/latest/meta-data/instance-id)
ENVIRONMENT=$(aws ec2 describe-tags --filters "Name=resource-id,Values=$INSTANCE_ID" "Name=key,Values=environment"  --output=text | cut -f5)

# pull docker image from ecr
docker pull 163482350712.dkr.ecr.eu-west-1.amazonaws.com/$DOCKER_IMAGE

# get env variables from parameter store
mkdir -p /var/docker/keys
mkdir -p /home/ec2-user/$APPLICATION_NAME
aws ssm get-parameter --region eu-west-1 --name "/unguess/api/$ENVIRONMENT/.env" --with-decryption --query "Parameter.Value" | sed -e 's/\\n/\n/g' -e 's/\\"/"/g' -e 's/^"//' -e 's/"$//' > /var/docker/.env
aws ssm get-parameter --region eu-west-1 --name "/tryber/api/$ENVIRONMENT/cloudfront.pem" --with-decryption --query "Parameter.Value" | sed -e 's/\\n/\n/g' -e 's/\\"/"/g' -e 's/^"//' -e 's/"$//' > /var/docker/keys/cloudfront.pem

source /var/docker/.env
if test -f "$DOCKER_COMPOSE_FILE"; then
    set +e
    IS_RUNNING=$(docker ps -a | grep $DOCKER_IMAGE| wc -l)
    set -e
    if [ "$IS_RUNNING" -eq "1" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE down
    fi
fi

echo "
version: '3'
services:
  app:
    image: 163482350712.dkr.ecr.eu-west-1.amazonaws.com/$DOCKER_IMAGE
    restart: always
    ports:
      - '80:80'
    environment:
      PORT: 80
      API_ROOT: '$API_ROOT'
      DB_HOST: '$DB_HOST'
      DB_PORT: '$DB_PORT'
      DB_USER: '$DB_USER'
      DB_PASSWORD: '$DB_PASSWORD'
      DB_NAME: '$DB_NAME'
      DB_SECONDARY_HOST: '$DB_SECONDARY_HOST'
      DB_SECONDARY_PORT: '$DB_SECONDARY_PORT'
      DB_SECONDARY_USER: '$DB_SECONDARY_USER'
      DB_SECONDARY_PASSWORD: '$DB_SECONDARY_PASSWORD'
      DB_SECONDARY_NAME: '$DB_SECONDARY_NAME'
      AWS_ACCESS_KEY_ID: '$AWS_ACCESS_KEY_ID'
      AWS_SECRET_ACCESS_KEY: '$AWS_SECRET_ACCESS_KEY'
      APP_URL: '$APP_URL'
      DEBUG: '$DEBUG'
      WP_LOGGED_IN_KEY: '$WP_LOGGED_IN_KEY'
      WP_LOGGED_IN_SALT: '$WP_LOGGED_IN_SALT'
      JWT_EXPIRATION: '$JWT_EXPIRATION'
      SENDGRID_KEY: '$SENDGRID_KEY'
      DEFAULT_SENDER_MAIL: '$DEFAULT_SENDER_MAIL'
      DEFAULT_SENDER_NAME: '$DEFAULT_SENDER_NAME'
      DEFAULT_CATEGORY: '$DEFAULT_CATEGORY'
      SENTRY_ENVIRONMENT: ${ENVIRONMENT}
      SENTRY_RELEASE: ${DOCKER_IMAGE}
      SENTRY_DSN: ${SENTRY_DSN}
      SENTRY_SAMPLE_RATE: ${SENTRY_SAMPLE_RATE:-1}
      CLOUDFRONT_KEY_ID: ${CLOUDFRONT_KEY_ID}
      NOTIFICATION_SERVICE_REST_API_ID: ${NOTIFICATION_SERVICE_REST_API_ID}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    volumes:
      - /var/docker/keys:/app/keys

" > $DOCKER_COMPOSE_FILE


docker-compose -f $DOCKER_COMPOSE_FILE up -d
