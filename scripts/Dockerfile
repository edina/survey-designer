FROM ubuntu:16.04

RUN apt-get update \ 
    && apt-get -y install build-essential libssl-dev curl git

RUN useradd -ms /bin/bash sd
USER sd
RUN cd

RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.25.0/install.sh | b
ash

RUN exit
USER sd
RUN cd
RUN  nvm install 4.0
RUN nvm alias default v4.0
RUN npm install -g jspm http-server
RUN git clone https://github.com/edina/survey-designer.git#0.0.7#
RUN cd survey-designer/dist
ENTRYPOINT http-server
