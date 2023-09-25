FROM ubuntu:focal

LABEL maintainer "VCityTeam"
LABEL source.repo "https://github.com/VCityTeam/UD-Demo-VCity-Sunlight"

RUN apt-get update

RUN apt-get install -y \
    curl \
    git

# Node version 18 is required. For its installation (on focal) refer to e.g.
# https://www.stewright.me/2023/04/install-nodejs-18-on-ubuntu-22-04/
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get install -y nodejs
RUN node --version
RUN npm --version

RUN git clone https://github.com/VCityTeam/UD-Demo-VCity-Sunlight.git
WORKDIR /UD-Demo-VCity-Sunlight

RUN npm i --legacy-peer-deps
RUN npm i
EXPOSE 80

CMD ["npm", "run", "debug"]