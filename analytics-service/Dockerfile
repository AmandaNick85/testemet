# Utiliza a versão estável e moderna do Node 24 em ambiente Alpine
FROM node:24-alpine

# Define o diretório de trabalho seguro
WORKDIR /app

# Copia os arquivos de mapeamento de dependências
COPY package*.json ./

# Instala as dependências de produção de forma limpa
RUN npm install --only=production && npm cache clean --force

# Copia o restante do código fonte
COPY . .

# Expõe a porta do serviço analítico
EXPOSE 3002

# Comando oficial de inicialização
CMD ["node", "src/server.js"]