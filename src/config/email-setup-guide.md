# Guia de Configuração do E-mail

## Passo a Passo Completo

### 1. Criar Conta no EmailJS
1. Acesse: https://www.emailjs.com/
2. Clique em "Sign Up" e crie sua conta
3. Confirme seu e-mail

### 2. Configurar Serviço de E-mail
1. No painel, vá em **Email Services**
2. Clique em **Add New Service**
3. Escolha seu provedor:
   - **Gmail**: Mais comum e fácil
   - **Outlook**: Para contas Microsoft
   - **Yahoo**: Para contas Yahoo
   - **Custom SMTP**: Para outros provedores

#### Para Gmail:
1. Selecione "Gmail"
2. Faça login com sua conta Google
3. Autorize o EmailJS
4. Anote o **Service ID** (ex: service_abc123)

### 3. Criar Template
1. Vá em **Email Templates**
2. Clique em **Create New Template**
3. Cole o template HTML fornecido acima
4. Configure:
   - **To Email**: `{{to_email}}`
   - **Subject**: `{{subject}}`
   - **Content**: Use o HTML fornecido
5. Teste o template
6. Anote o **Template ID** (ex: template_xyz789)

### 4. Obter Public Key
1. Vá em **Account** → **General**
2. Copie a **Public Key** (ex: user_abcdefghijk)

### 5. Atualizar Código
No arquivo `src/services/email.ts`, substitua:
```javascript
const SERVICE_ID = 'seu_service_id_aqui';
const TEMPLATE_ID = 'seu_template_id_aqui';
const USER_ID = 'sua_public_key_aqui';
```

### 6. Configurar E-mails de Destino
No mesmo arquivo, altere:
```javascript
to_email: 'seu-email@empresa.com',
cc_email: 'outro-email@empresa.com', // opcional
```

## Limites da Conta Gratuita
- **200 e-mails/mês** na conta gratuita
- Para mais e-mails, considere o plano pago
- Histórico de 30 dias

## Teste de Configuração
1. Após configurar, faça um checklist de teste
2. Verifique se o e-mail chegou
3. Confirme se todas as informações estão corretas
4. Teste com problemas e fotos

## Solução de Problemas Comuns

### E-mail não chega:
- Verifique spam/lixo eletrônico
- Confirme se o Service ID está correto
- Teste o template no painel do EmailJS

### Erro de autenticação:
- Verifique se a Public Key está correta
- Reautorize o serviço de e-mail

### Template não funciona:
- Verifique se todas as variáveis estão corretas
- Teste o template no painel antes de usar

## Segurança
- Nunca compartilhe suas chaves de API
- Use variáveis de ambiente em produção
- Monitore o uso para evitar spam