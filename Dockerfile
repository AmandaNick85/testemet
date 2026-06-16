# Fallback para deploy Docker na raiz do repositório (Render sem rootDir configurado).
# O ideal é usar o Blueprint (render.yaml) com rootDir: analytics-service.
FROM node:24-alpine

WORKDIR /app

COPY analytics-service/package*.json ./
RUN npm install --only=production && npm cache clean --force

COPY analytics-service/ .

EXPOSE 3002

CMD ["node", "src/server.js"]
