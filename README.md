# MedMetrics - Sistema de Gestão de Saúde e Analytics (Novo DEGASE)

Solução de software baseada em microsserviços desenvolvida para otimizar, centralizar e auditar os registros de atendimentos e intervenções técnicas realizados pelas equipes de assistência aos adolescentes no ecossistema do Novo DEGASE.

## 📋 Descrição do Problema
O acompanhamento de adolescentes em medidas socioeducativas envolve múltiplas frentes (técnica multidisciplinar e saúde mental). Sistemas monolíticos tradicionais sofrem com acoplamento excessivo, falhas de sincronização e misturam auditorias analíticas com dados transacionais de autenticação. O MedMetrics resolve isso dividindo as responsabilidades em microsserviços especializados, garantindo integridade regulatória, LGPD e alta escalabilidade.

---

## 🛠️ Arquitetura e Divisão de Microsserviços

O ecossistema é orquestrado via **Docker Compose** e dividido em:
1. **Frontend (React + Tailwind CSS):** Interface responsiva que gerencia o fluxo de controle de acesso (RBAC) e as telas operacionais do Diretor Técnico e do Técnico de Saúde.
2. **Auth-Service (Node.js + Express + PostgreSQL):** Gerencia o controle transacional de usuários, cadastro de funcionários e emissão de tokens de segurança JWT. (Porta `3001`).
3. **Analytics-Service (Node.js + Express + MongoDB):** Implementa os pilares da **Arquitetura Limpa (Clean Architecture)** para registrar e computar os indicadores clínicos e relatórios de evolução. (Porta `3002`).

---

## 📐 Arquitetura e Padrões de Projeto (Design Patterns)

O sistema foi desenvolvido seguindo os princípios da **Clean Architecture (Arquitetura Limpa)** e do **SOLID**, garantindo o desacoplamento entre as regras de negócio puras (domínio) e as tecnologias de infraestrutura (bancos de dados, frameworks HTTP e bibliotecas externas).

Abaixo estão detalhados os 4 Design Patterns fundamentais aplicados no ecossistema:

### 1. Repository Pattern (Padrão Repositório)
* **Onde foi aplicado:** `src/infrastructure/database/mongodb/AtendimentoRepository.js`
* **Justificativa:** Este padrão atua como um mediador e uma camada de abstração entre o domínio puro da aplicação e o mecanismo de persistência de dados (Mongoose/MongoDB).
* **Impacto Arquitetural:** Garante o desacoplamento total. Caso haja a necessidade de substituir o MongoDB por um banco de dados relacional (como PostgreSQL), apenas um novo repositório precisará ser criado respeitando a mesma interface. As regras de negócio e os casos de uso permanecerão 100% intactos.

### 2. Dependency Injection / Inversion (Injeção e Inversão de Dependência)
* **Onde foi aplicado:** No construtor do caso de uso em `src/domain/usecases/RegistrarAtendimento.js` (`constructor(atendimentoRepository)`).
* **Justificativa:** Em vez de o caso de uso instanciar diretamente o banco de dados internamente (alto acoplamento), ele recebe a abstração do repositório já instanciada através do seu construtor (cumprindo o "D" do SOLID).
* **Impacto Arquitetural:** Torna o sistema altamente testável via **TDD (Test-Driven Development)**. Nos testes unitários com o Jest, é possível injetar um repositório simulado (*Mock Repository* em memória), isolando completamente os testes de qualquer conexão física com o banco de dados.

### 3. Singleton Pattern
* **Onde foi aplicado:** Na inicialização e exportação da conexão com o banco de dados no ciclo de vida do servidor (`src/server.js`).
* **Justificativa:** Garante que a aplicação possua apenas uma única instância ativa da conexão com o MongoDB em execução, fornecendo um ponto global de acesso a ela.
* **Impacto Arquitetural:** Em ambientes de microsserviços, abrir uma nova conexão para cada requisição HTTP recebida degrada a performance rapidamente por esgotamento de sockets. O Singleton garante a reutilização eficiente da mesma conexão para persistir os dados dos relatórios.

### 4. Proxy / Decorator Pattern
* **Onde foi aplicado:** No componente de segurança do Frontend `GuardedRoute` (`src/App.jsx`).
* **Justificativa:** Funciona como um escudo interceptador que envolve as rotas dos painéis operacionais (`DiretorDashboard` e `TecnicoDashboard`), avaliando os tokens e as permissões de acesso (RBAC) antes de permitir a renderização das telas.
* **Impacto Arquitetural:** Isola completamente a lógica de segurança, governança e autenticação para fora dos componentes de visualização. Os dashboards focam apenas em exibir dados e gráficos, delegando o controle de acesso ao Proxy.

---

## ☁️ Estratégia de Deploy (Ambiente de Produção)

O ecossistema do MedMetrics foi projetado para ser distribuído e conteinerizado, facilitando o deploy na plataforma **Render** através do ecossistema Docker.

### 1. Infraestrutura de Bancos de Dados (Multi-Cloud)
Para garantir resiliência e conformidade com os limites das camadas gratuitas em produção, os bancos de dados são hospedados de forma dedicada:
* **Módulo de Autenticação (Relacional):** Instância PostgreSQL gerenciada via **Supabase** ou **Neon.tech**.
* **Módulo de Analytics (Não-Relacional):** Cluster MongoDB gerenciado via **MongoDB Atlas**.

### 2. Arquitetura de Serviços no Render
A aplicação é dividida em 3 serviços independentes conectados ao mesmo repositório do GitHub, utilizando a propriedade `Root Directory` para isolar os contextos:

| Serviço no Render | Tipo de Serviço | Runtime / Root Directory | Variáveis de Ambiente Necessárias (`.env`) |
| :--- | :--- | :--- | :--- |
| **Frontend** | Static Site | Node / `frontend` | `VITE_API_AUTH_URL`, `VITE_API_ANALYTICS_URL` |
| **Auth-Service** | Web Service | Node / `auth-service` | `DATABASE_URL` (Postgres), `JWT_SECRET`, `PORT=3001` |
| **Analytics-Service**| Web Service | **Docker** / `analytics-service` | `MONGO_URI`, `JWT_SECRET`, `PORT=3002` |

> 💡 **Nota de Infraestrutura:** O `analytics-service` utiliza o Runtime **Docker** nativo do Render. A plataforma lê o `Dockerfile` interno do microsserviço, constrói a imagem Linux isolada e expõe a API de forma idêntica ao ambiente de desenvolvimento local, anulando o problema do *"na minha máquina funciona"*.

---
## 🧪 Engenharia de Testes e Automação (TDD via Docker)

O projeto adota a metodologia de **Test-Driven Development (Desenvolvimento Orientado por Testes - TDD)** para a validação das regras de negócio do domínio. A suíte de testes foi projetada para rodar de forma totalmente isolada dentro do ecossistema conteinerizado, garantindo que o ambiente de testes seja idêntico ao de desenvolvimento e produção.

### 🚀 Arquitetura de Testes com ES Modules (ESM)
Com a migração do projeto para o padrão moderno do ecossistema Node.js (`"type": "module"`), a execução do framework **Jest** foi configurada para suportar nativamente a resolução de módulos assíncronos e caminhos relativos explícitos (extensões `.js`), utilizando a flag experimental de ciclo de vida de VMs do Node.js.

O script de automação injeta a flag diretamente no escopo global de execução:
```json
"scripts": {
  "test": "NODE_OPTIONS=--experimental-vm-modules jest"
}
---

## 🎭 Cenários de Comportamento (BDD)

# language: pt
Funcionalidade: Registro de Atendimentos Técnicos no DEGASE
  Como um Técnico Socioeducativo autorizado no MedMetrics
  Eu quero registrar os atendimentos prestados aos adolescentes no sistema
  Para que os indicadores clínicos e sociais sejam computados no Analytics-Service.

  Cenário: Registro de atendimento realizado com sucesso
    Dado que o usuário está autenticado com o perfil de "TECNICO"
    E preenche o formulário com o ID do adolescente "5005"
    E seleciona a equipe "EQUIPE_SAUDE_MENTAL"
    E seleciona o tipo de intervenção "INDIVIDUAL"
    E insere a evolução "Adolescente apresentou boa evolução no atendimento psicossocial."
    Quando ele clica em "Salvar Atendimento"
    Então o sistema deve processar a requisição através do UseCase "RegistrarAtendimento"
    E deve salvar o registro com sucesso na coleção do MongoDB
    E exibir a mensagem "Atendimento clínico registrado e enviado para a base MongoDB!"

