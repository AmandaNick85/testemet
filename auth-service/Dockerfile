FROM node:24-alpine

WORKDIR /app

# Copia os arquivos de mapeamento de dependências
COPY package*.json ./

# Instala dependencias normais de produção, limpando o cache para reduzir tamanho
RUN npm install --only=production && npm cache clean --force

# Copia o restante do código fonte
COPY . .

# Expõe a porta do serviço de autenticação
EXPOSE 3001

# Comando oficial de inicialização
CMD ["node", "src/server.js"]