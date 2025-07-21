# 📊 Desafio Técnico - API RESTful (Node.js + PostgreSQL + Prisma)

Este é um projeto backend de uma API RESTful desenvolvida em Node.js com Express, utilizando PostgreSQL, Prisma ORM e autenticação via JWT. A aplicação permite o upload e ingestão de arquivos `.csv` e `.pdf`, armazena os dados em banco e fornece endpoints para autenticação, consulta e busca textual com auxílio de um MockIA.

---

## 🚀 Tecnologias Utilizadas

- Node.js + Express  
- PostgreSQL + Prisma ORM  
- JWT para autenticação  
- Multer para upload de arquivos  
- `csv-parse` para leitura de arquivos CSV  
- `pdf-parse` para leitura de arquivos PDF  
- Docker e Docker Compose  
- dotenv para variáveis de ambiente  
- REST Client para testes 
- Postman para testes

---

## 📂 Estrutura do Projeto

```
desafio-tecnico-backend/
├── prisma/
│   ├── migrations/
│   │   ├── 20250719132754_create_users/
│   │   ├── 20250719165900_add_records_table/
│   │   └── 20250720175001_create_query_model/
│   ├── migration_lock.toml
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── datasets.controller.js
│   │   ├── queries.controller.js
│   │   ├── records.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── datasets.routes.js
│   │   ├── queries.routes.js
│   │   ├── records.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   └── parseCSV.js
│   └── index.js
├── uploads/
├── tests/
│   ├──── auth.controller.test.js
├── └──utils/
│      └── parseCSV.test.js
├── .env
├── .env.docker
├── .env.docker.example
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
└── testes.http
```

---

## 🔐 Autenticação

Utiliza JWT. Após login, envie o token no header:

```
Authorization: Bearer <seu_token>
```

---

## 🧪 Endpoints da API

### 🧍‍♂️ Autenticação

- `POST /auth/register` — Cadastra novo usuário  
- `POST /auth/login` — Login e geração de token  
- `GET /me` — Retorna dados do usuário autenticado  

---

### 📁 Upload e Ingestão de Arquivos

- `POST /datasets/upload` — Upload de arquivos `.csv` ou `.pdf`  
  - Requer autenticação
  - Arquivos salvos localmente em ./uploads  
  - Os dados extraídos são salvos no banco de dados nas tabelas `Dataset` e `Record`.  

---

### 📚 Consulta e Listagem

- `GET /datasets` — Lista os datasets do usuário autenticado  
- `GET /datasets/:id/records` — Lista os registros de um dataset  
- `GET /records/search?query=palavra` — Busca textual por palavra-chave no JSON   

---

### 🤖 Registro de Buscas com Mock IA

- `POST /queries` — Registra uma pergunta e simula uma resposta com base em palavras-chave  
- Requer `pergunta` e `datasetId` no corpo da requisição  
- Simula uma resposta sem integração real com serviços externos de IA
- Registra: pergunta, resposta, usuário e data na tabela `queries`

---

### 🧠 Histórico de Consultas

- `GET /queries` — Lista todas as perguntas e respostas feitas anteriormente pelo usuário autenticado

---

### 📖 Documentação Swagger (OpenAPI)

- Documentação interativa e detalhada da API, gerada automaticamente a partir dos comentários nos controllers e rotas  
- Acesse em: `http://localhost:3000/api-docs` após iniciar a aplicação  
- Permite visualizar, testar e entender todos os endpoints, incluindo autenticação com JWT  
- Facilita consumo da API por frontend e terceiros, além de servir como referência técnica  

---

## ⚙️ Instalação e Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/)  
- [Docker](https://www.docker.com/)  
- [Docker Compose](https://docs.docker.com/compose/)  

---

### 1. Clone o repositório

```bash
git clone https://github.com/rodrigossbjj/desafio-tecnico-backend.git
cd desafio-tecnico-backend
```

---

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env`:

```env
DATABASE_URL=postgresql://postgres:admin@db:5432/desafioTecnico
JWT_SECRET=sua_chave_super_segura
```

Crie um arquivo `.env.docker`:

```env.docker
DATABASE_URL=postgresql://postgres:admin@db:5432/desafioTecnico
JWT_SECRET=sua_chave_super_segura
NODE_ENV=development
```

Use uma chave forte para `JWT_SECRET`. Gere uma em: https://generate-random.org/string-generator

---

### 3. Execute com Docker

```bash
docker-compose up --build
```

A aplicação estará disponível em `http://localhost:3000`

---

## 🧪 Testando com Insomnia, Postman ou extensão REST Client (Upload não é possível em REST Client)

Use os endpoints e lembre-se de:

- Adicionar o token JWT nas rotas protegidas  
- Testar upload de `.csv` e `.pdf` via form-data  

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

Desenvolvido por Rodrigo Sales para desafio técnico NUVEN.