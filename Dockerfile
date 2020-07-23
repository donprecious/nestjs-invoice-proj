FROM node:10
WORKDIR /app
COPY ./package.json ./
COPY ./run.sh ./
RUN npm install
COPY . .
RUN npm run build
RUN ls -lthra 
RUN chmod 755 run.sh
# EXPOSE 3000
#CMD ["npm", "run", "start:prod"]
ENTRYPOINT ["/bin/bash", "/run.sh"]