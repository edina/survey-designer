FROM ubuntu:xenial

MAINTAINER EDINA

# install dependencies
RUN apt-get update && apt-get -yq install apache2 wget && apt-get clean && rm -rf /var/lib/apt/lists/*

ARG version=1.0.0
ARG pcapi_host=0.0.0.0:8080
ARG dir=/var/www/html/

ENV version=$version
ENV pcapi_host=$pcapi_host

# untar SD release
RUN wget https://github.com/edina/survey-designer/releases/download/$version/survey-designer.tar.gz -O - | tar -xz -C $dir

# configure PCAPI endpoint
RUN cp /var/www/html/config/docker_env.json $dir/config/env.json
RUN sed -i "s/BASE_URL/${pcapi_host}/g" $dir/config/env.json
