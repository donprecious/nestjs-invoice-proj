FROM node:10.22.0-alpine3.11
WORKDIR /app
COPY ./package.json ./
COPY ./run.sh ./
RUN npm install
COPY . .
RUN npm run build
RUN chmod 755 run.sh
# EXPOSE 3000
#CMD ["npm", "run", "start:prod"]
RUN ls -lthra 
ENTRYPOINT ["/bin/bash", "run.sh"]