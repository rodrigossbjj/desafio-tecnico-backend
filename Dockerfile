# Etapa 1: imagem base
FROM node:22

# Cria diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante da aplicação
COPY . .

# Expõe a porta da aplicação
EXPOSE 3000

# Gera o cliente do Prisma
RUN npx prisma generate

# Comando para iniciar a API
CMD ["node", "src/index.js"]
