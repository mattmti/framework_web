# Étape 1 : Build
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install --unsafe-perm

COPY . .

RUN npm run build

# Étape 2 : Serve avec Nginx
FROM nginx:alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]