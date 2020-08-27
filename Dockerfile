FROM node:14
RUN npm install -g @angular/cli@9.1.0
RUN mkdir /code
WORKDIR /code
COPY ./ /code/
RUN rm -r /code/node_modules/
RUN npm install
