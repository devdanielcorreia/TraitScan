# TraitScan - Documento de Requisitos do Produto

## 1. Visão Geral do Produto\n
### 1.1 Nome da Aplicação
TraitScan

### 1.2 Descrição
Plataforma SaaS multiempresa e multilíngue para automação de avaliações psicológicas personalizadas aplicadas a funcionários de empresas. A plataforma permite que psicólogos criem, enviem e analisem avaliações, enquanto empresas pagam assinatura para acessar relatórios.
\n### 1.3 Modelo de Monetização
Assinatura mensal via Stripe paga pelas empresas, com período trial de 7 dias.

## 2. Tipos de Usuários

### 2.1 Administrador da Plataforma (Superadmin)
- Gerencia psicólogos e empresas
- Controla faturamento e assinaturas\n- Pode promover psicólogos para admin
\n### 2.2 Psicólogos
- Criam e gerenciam quizzes e avaliações
- Cadastram empresas atendidas
- Aplicam avaliações aos funcionários
- Visualizam relatórios

### 2.3 Empresas (Gestores)\n- Cadastram funcionários\n- Visualizam relatórios de avaliações
- Gerenciam assinatura Stripe

### 2.4 Funcionários
- Não possuem login
- Recebem link único para responder avaliações
\n## 3. Stack Tecnológica

### 3.1 Frontend
- TypeScript
- React + Vite
- Tailwind CSS
- Biblioteca de UI: Shadcn/UI, Radix ou similar
- Arquitetura SPA com rotas protegidas

### 3.2 Backend e Infraestrutura
- Supabase (Auth, PostgreSQL, Storage, RLS)
- Stripe Billing para assinaturas
- Supabase Edge Functions para webhooks
- Vercel para deploy

## 4. Funcionalidades Principais

### 4.1 Sistema de Quizzes
- Cada quiz contém:
  - Nome (ex: 'Assertividade', 'Relacionamento Interpessoal')
  - Descrição
  - 10 perguntas obrigatórias
  - 4 alternativas por pergunta com texto e peso (1 a 4)
- Psicólogos podem criar, editar, duplicar e arquivar quizzes
- Biblioteca de quizzes isolada por psicólogo

### 4.2 Sistema de Avaliações
- Avaliação composta por:
  - Nome (ex: 'Perfil de Colaboração')
  - Descrição
  - Combinação de N quizzes existentes
- Avaliações salvas como templates reutilizáveis

### 4.3 Aplicação de Avaliações
- Psicólogo seleciona empresa, funcionário e avaliação
- Sistema gera link único para o funcionário
- Funcionário acessa link sem login e responde
- Respostas salvas e processadas automaticamente

### 4.4 Sistema de Relatórios
- Resultado por quiz com soma dos pesos
- Percentual relativo da característica avaliada
- Interpretação básica dos resultados
- Empresa acessa apenas relatórios de seus funcionários
- Psicólogo visualiza apenas relatórios das empresas cadastradas por ele

## 5. Isolamento de Dados e Multiempresa
\n### 5.1 Regras de Isolamento
**Psicólogo visualiza:**
- Seus próprios quizzes e avaliações\n- Empresas que ele cadastrou
- Funcionários dessas empresas

**Empresa visualiza:**
- Seus funcionários
- Avaliações aplicadas a eles
- Relatórios correspondentes

**Administrador visualiza:**
- Todas empresas e psicólogos
- Faturamento e assinaturas
- Pode promover psicólogos

### 5.2 Implementação
Isolamento via Row Level Security (RLS) no Supabase

## 6. Sistema de Convites e Cadastro

### 6.1 Fluxo de Convites
- Ninguém cria conta livremente
- Administrador cadastra psicólogos e empresas via convite com token mágico
- Psicólogos podem cadastrar empresas e convidar outros psicólogos
- Empresas cadastram funcionários
- Funcionários não possuem login
\n## 7. Sistema de Assinaturas (Stripe)\n
### 7.1 Planos
- Trial: 7 dias gratuitos ao ativar conta
- Plano Pro: mensal (valor configurável via variável de ambiente)

### 7.2 Regras de Acesso
- Empresa acessa painel apenas com trial ativo OU assinatura ativa
- Após fim do trial sem assinatura: empresa bloqueada\n- Psicólogo continua visualizando empresa, mas sem acesso a relatórios detalhados

### 7.3 Webhooks do Stripe
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted

## 8. Áreas da Aplicação

### 8.1 Área do Administrador
- Dashboard com métricas
- Gestão de psicólogos (criar, editar, suspender)
- Gestão de empresas (criar, editar, suspender)
- Gerenciamento de convites\n- Faturamento e assinaturas Stripe
- Promoção de psicólogos para admin

### 8.2 Área do Psicólogo
- Dashboard
- Cadastro e gestão de quizzes\n- Cadastro e gestão de avaliações (templates)
- Cadastro de empresas\n- Convite de psicólogos
- Gestão de funcionários das empresas\n- Aplicação de avaliações
- Visualização de relatórios
- Configurações de perfil

### 8.3 Área da Empresa
- Dashboard\n- Cadastro de funcionários
- Visualização de relatórios das avaliações
- Página de gerenciamento de assinatura Stripe
- Configurações da empresa
\n## 9. Multilíngue

### 9.1 Idiomas Suportados
- Português
- Inglês
- Espanhol
\n### 9.2 Implementação
- Sistema i18n com arquivos JSON de tradução
- Seletor de idioma no header
- Idioma salvo no Supabase e aplicado no login

## 10. Tema Visual

### 10.1 Modos de Tema
- Tema claro
- Tema escuro\n- Toggle no header
- Persistência no localStorage
\n## 11. Landing Page\n
### 11.1 Público-Alvo\nEmpresas que contratarão o serviço
\n### 11.2 Conteúdo
- Benefícios da plataforma\n- Como psicólogos utilizam o sistema
- Como empresas visualizam relatórios\n- Tabela de preços
- Fluxo de contratação
- Formulário para empresa deixar e-mail e receber contato
\n## 12. Requisitos Não Funcionais
\n### 12.1 Interface
- Design moderno e limpo
- Totalmente responsiva
- Componentes de UI consistentes

### 12.2 Código\n- Organização por domínios
- Estrutura de pastas bem definida
- Tipagem forte com TypeScript\n- Comentários objetivos em partes complexas
- Código modular e escalável

### 12.3 Segurança
- Autenticação via Supabase Auth
- Rotas protegidas por tipo de usuário\n- RLS para isolamento de dados
- Validação de assinaturas ativas

## 13. Estilo de Design

- **Paleta de cores**: Tons profissionais com azul corporativo como cor primária, cinza neutro para backgrounds, verde para indicadores positivos
- **Layout**: Interface em cards com espaçamento generoso, hierarquia visual clara entre seções
- **Tipografia**: Fontes sans-serif modernas, tamanhos diferenciados para títulos e corpo de texto
- **Componentes**: Botões com bordas arredondadas sutis, inputs com feedback visual, tabelas com alternância de cores nas linhas
- **Navegação**: Sidebar fixa para áreas administrativas, breadcrumbs para orientação do usuário

## 14. Fluxos de Usuário Principais

### 14.1 Fluxo de Cadastro eAtivação
1. Administrador envia convite para psicólogo ou empresa
2. Destinatário recebe e-mail com token mágico
3. Clica no link e define senha
4. Contaativada com trial de 7 dias (para empresas)
5. Redirecionamento para dashboard correspondente

### 14.2 Fluxo de Criação de Avaliação
1. Psicólogo acessa área de quizzes
2. Cria quizzes individuais com10 perguntas cada
3. Acessa área de avaliações
4. Cria template de avaliação combinando múltiplos quizzes
5. Salva template para uso futuro

### 14.3 Fluxo de Aplicação de Avaliação
1. Psicólogo seleciona empresa cliente
2. Escolhe funcionário da lista
3. Seleciona template de avaliação
4. Sistema gera link único com token
5. Psicólogo envia link ao funcionário (e-mail, WhatsApp, etc.)
6. Funcionário acessa link sem login
7. Responde todos os quizzes da avaliação
8. Sistema processa respostas automaticamente
9. Relatório gerado e disponível para empresa e psicólogo

### 14.4 Fluxo de Assinatura
1. Empresaativa conta com trial de 7 dias
2. Acessa área de assinatura no painel
3. Clica em 'Assinar Plano Pro'
4. Redirecionada para Stripe Checkout
5. Completa pagamento\n6. Webhook confirma assinatura
7. Acesso liberado indefinidamente enquanto assinatura ativa

## 15. Modelo de Dados Conceitual

### 15.1 Tabelas Principais
\n**users**
- id, email, role (admin/psychologist/company), created_at, language, theme

**psychologists**
- id, user_id, name, specialty, created_by_admin_id\n
**companies**
- id, user_id, name, created_by_psychologist_id, subscription_status, trial_end_date, stripe_customer_id

**employees**
- id, company_id, name, email, position\n
**quizzes**
- id, psychologist_id, name, description, archived\n
**questions**
- id, quiz_id, text, order\n
**answers**
- id, question_id, text, weight (1-4)\n
**assessments**
- id, psychologist_id, name, description\n
**assessment_quizzes**
- id, assessment_id, quiz_id\n
**applied_assessments**
- id, assessment_id, employee_id, psychologist_id, token, status, created_at, completed_at

**responses**
- id, applied_assessment_id, question_id, answer_id\n
**reports**
- id, applied_assessment_id, results_json, generated_at

### 15.2 Políticas RLS
- Psicólogos acessam apenas dados de empresas que cadastraram
- Empresas acessam apenas dados de seus funcionários
- Administradores têm acesso total\n- Funcionários não possuem acesso direto ao banco\n
## 16. Integrações Externas

### 16.1 Stripe
- Checkout Sessions para pagamento
- Customer Portal para gerenciamento de assinatura
- Webhooks para sincronização de status
- Variáveis de ambiente para chaves API

### 16.2 Supabase
- Auth para autenticação
- PostgreSQL para dados\n- Storage para arquivos (se necessário)
- Edge Functions para webhooks Stripe
- Realtime para atualizações (opcional)

### 16.3 Envio de E-mails
- Convites com tokens mágicos
- Notificações de avaliações aplicadas
- Alertas de fim de trial
- Confirmações de assinatura
\n## 17. Roadmap de Implementação

### 17.1 Fase 1 - Fundação (Semanas 1-2)
- Configuração do projeto React + Vite + TypeScript
- Setup Supabase e estrutura de banco\n- Sistema de autenticação básico
- Rotas protegidas por role
\n### 17.2 Fase 2 - Core Features (Semanas 3-5)
- CRUD de quizzes e perguntas
- CRUD de avaliações (templates)
- Sistema de convites\n- Cadastro de empresas e funcionários
\n### 17.3 Fase 3 - Aplicação e Relatórios (Semanas 6-7)
- Geração de links únicos
- Interface de resposta para funcionários
- Processamento de respostas
- Geração de relatórios
\n### 17.4 Fase 4 - Monetização (Semana 8)
- Integração Stripe
- Sistema de trial\n- Webhooks\n- Bloqueio de acesso\n\n### 17.5 Fase 5 - Polimento (Semanas 9-10)
- Sistema multilíngue
- Tema claro/escuro
- Landing page
- Testes e ajustes finais

## 18. Considerações de Escalabilidade

### 18.1 Performance
- Paginação em listagens longas
- Cache de relatórios gerados
- Lazy loading de componentes
- Otimização de queries com índices

### 18.2 Manutenibilidade
- Documentação inline em código complexo
- Testes unitários para lógica de negócio
- Versionamento de API
- Logs estruturados

### 18.3 Monitoramento
- Tracking de erros (Sentry ou similar)
- Analytics de uso (opcional)
- Métricas de conversão trial → assinatura
- Alertas de falhas em webhooks