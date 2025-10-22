#! /bin/bash

source script/variables.sh

script/prod-build-web-client.sh

set -e
docker build -t $SNOWJAM_DOCKER_IMAGE .
set +e

version=`script/update-version.py read`

docker image tag $SNOWJAM_DOCKER_IMAGE $SNOWJAM_DOCKER_IMAGE:$version

if [ ! -z $1 ]; then
  docker push $SNOWJAM_DOCKER_IMAGE
  docker push $SNOWJAM_DOCKER_IMAGE:$version
fi
