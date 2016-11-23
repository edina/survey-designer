FROM ubuntu:xenial

MAINTAINER EDINA

# install dependencies
RUN apt-get update && apt-get -yq install apache2 wget && apt-get clean && rm -rf /var/lib/apt/lists/*

# untar SD release
WORKDIR /var/www/html/
RUN wget https://github.com/edina/survey-designer/releases/download/1.0.0/survey-designer.tar.gz -O - | tar -xz
