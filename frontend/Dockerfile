# Estágio 1: Compilação da aplicação React com Node 24
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies como o Vite e Tailwind v4)
RUN npm install

COPY . .

ARG VITE_AUTH_API_URL=http://localhost:3001/api
ARG VITE_ANALYTICS_API_URL=http://localhost:3002/api
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_ANALYTICS_API_URL=$VITE_ANALYTICS_API_URL

# Gera os arquivos estáticos de produção na pasta /app/dist
RUN npm run build

# Estágio 2: Servidor Web Nginx leve para servir os arquivos estáticos
FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos compilados do React para o diretório padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta padrão do servidor web
EXPOSE 80

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]
