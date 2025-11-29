# TraitScan - Guia Rápido

## 🎯 O que é o TraitScan?

TraitScan é uma plataforma SaaS multiempresa para automação de avaliações psicológicas. Permite que psicólogos criem quizzes personalizados, apliquem avaliações em funcionários de empresas e gerem relatórios automáticos.

## 🚀 Começando

### 1. Primeiro Acesso

1. Abra a aplicação
2. Você verá a **Landing Page** com informações sobre a plataforma
3. Clique em **"Começar Agora"** ou **"Entrar"**

### 2. Criar Conta

1. Na tela de login, insira:
   - **Usuário**: escolha um nome de usuário (sem espaços)
   - **Senha**: crie uma senha segura
2. Clique em **"Entrar"**
3. ✨ **Importante**: O primeiro usuário se torna automaticamente **Superadministrador**

### 3. Explorar o Dashboard

Após o login, você verá o dashboard com:
- Estatísticas da plataforma
- Navegação no topo (varia conforme seu perfil)
- Seletor de idioma (🇧🇷 🇺🇸 🇪🇸)
- Toggle de tema claro/escuro (☀️ 🌙)

## 👨‍⚕️ Como Psicólogo

### Criar um Quiz

1. Clique em **"Quizzes"** no menu
2. Clique em **"Criar Quiz"**
3. Preencha:
   - Nome do quiz (ex: "Assertividade")
   - Descrição (opcional)
4. Crie **10 perguntas** (obrigatório)
5. Para cada pergunta, adicione **4 alternativas** com pesos de 1 a 4
6. Clique em **"Salvar"**

### Gerenciar Quizzes

- **Editar**: Clique no ícone de lápis
- **Duplicar**: Clique no ícone de cópia (cria uma cópia do quiz)
- **Arquivar**: Clique no ícone de arquivo

### Cadastrar Empresas

1. Clique em **"Empresas"** no menu
2. Clique em **"Criar Empresa"**
3. Preencha:
   - Nome da empresa
   - E-mail de contato
   - Telefone
   - Endereço
4. Clique em **"Criar"**

## 🏢 Como Empresa

### Cadastrar Funcionários

1. Clique em **"Funcionários"** no menu
2. Clique em **"Criar Funcionário"**
3. Preencha:
   - Nome completo (obrigatório)
   - E-mail
   - Cargo
   - Departamento
4. Clique em **"Salvar"**

### Gerenciar Funcionários

- **Editar**: Clique no ícone de lápis na tabela
- **Excluir**: Clique no ícone de lixeira

## 👤 Como Funcionário (Fazer Avaliação)

1. Receba o link único da avaliação
2. Abra o link no navegador
3. Leia as perguntas e selecione as alternativas
4. Clique em **"Próximo"** ou **"Finalizar"**
5. Veja a mensagem de conclusão ✅

## ⚙️ Configurações

### Mudar Idioma

1. Clique no ícone de globo (🌐) no header
2. Selecione:
   - 🇧🇷 Português
   - 🇺🇸 English
   - 🇪🇸 Español

### Mudar Tema

1. Clique no ícone de sol/lua no header
2. Alterna entre tema claro e escuro

### Sair da Conta

1. Clique no ícone de logout no header
2. Você será redirecionado para a página de login

## 📊 Estrutura de Dados

### Quiz
- Nome e descrição
- 10 perguntas obrigatórias
- 4 alternativas por pergunta
- Pesos de 1 a 4 para cada alternativa

### Avaliação (Template)
- Combina múltiplos quizzes
- Pode ser reutilizada
- ⚠️ **Ainda não implementado**

### Aplicação de Avaliação
- Link único para o funcionário
- Status: pendente, em andamento, concluído, expirado
- Expira em 30 dias

## 🎨 Dicas de Interface

### Cores
- **Azul**: Cor primária (botões, links)
- **Verde**: Sucesso
- **Vermelho**: Erro ou ação destrutiva
- **Cinza**: Elementos secundários

### Notificações
- Aparecem no canto superior direito
- Verde: Sucesso ✅
- Vermelho: Erro ❌
- Azul: Informação ℹ️

### Responsividade
- A plataforma funciona em desktop, tablet e mobile
- Navegação adaptativa conforme o tamanho da tela

## ❓ Perguntas Frequentes

### Como criar uma avaliação?
⚠️ **Funcionalidade ainda não implementada**. Em breve você poderá combinar múltiplos quizzes em uma avaliação.

### Como aplicar uma avaliação a um funcionário?
⚠️ **Funcionalidade ainda não implementada**. Em breve você poderá gerar links únicos para funcionários.

### Como visualizar relatórios?
⚠️ **Funcionalidade ainda não implementada**. Em breve haverá relatórios automáticos com pontuações e interpretações.

### Como gerenciar assinaturas?
⚠️ **Integração Stripe ainda não implementada**. O sistema de assinatura será adicionado em breve.

### Posso convidar outros psicólogos?
⚠️ **Sistema de convites ainda não implementado**. Por enquanto, novos usuários devem criar conta diretamente.

## 🔐 Segurança

- Todas as senhas são criptografadas
- Dados isolados por empresa (RLS)
- Psicólogos só veem suas próprias empresas
- Empresas só veem seus próprios funcionários
- Funcionários acessam avaliações via token único (sem login)

## 🌍 Multilíngue

A plataforma está totalmente traduzida em:
- **Português** (padrão)
- **Inglês**
- **Espanhol**

Sua preferência de idioma é salva automaticamente.

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge (versões recentes)
- ✅ Desktop, Tablet, Mobile
- ✅ Tema claro e escuro

## 🆘 Problemas Comuns

### Não consigo fazer login
- Verifique se o usuário não tem espaços
- Senha é case-sensitive (diferencia maiúsculas/minúsculas)

### Não vejo minhas empresas/funcionários
- Verifique se você está logado com o perfil correto
- Psicólogos só veem empresas que eles criaram
- Empresas só veem seus próprios funcionários

### O quiz não salva
- Certifique-se de ter exatamente 10 perguntas
- Cada pergunta deve ter 4 alternativas
- Todos os campos de texto devem estar preenchidos

### Link de avaliação não funciona
- Verifique se o link está completo
- Links expiram após 30 dias
- Avaliações já concluídas não podem ser refeitas

## 📞 Suporte

Para dúvidas técnicas ou problemas:
1. Consulte este guia
2. Verifique o arquivo IMPLEMENTATION_STATUS.md
3. Revise a documentação do Supabase

## 🎓 Próximos Passos

1. ✅ Crie seus primeiros quizzes
2. ✅ Cadastre empresas
3. ✅ Adicione funcionários
4. ⏳ Aguarde implementação de avaliações
5. ⏳ Aguarde implementação de relatórios

---

**Versão**: 1.0.0 (MVP)  
**Última atualização**: 2025-11-28
