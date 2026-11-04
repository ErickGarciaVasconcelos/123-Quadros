# Segurança do painel administrativo

## O que já está ativo no `admin.html`

- Tela de login obrigatória antes de carregar o catálogo.
- Login real com **Supabase Auth** (e-mail + senha verificados no servidor).
- Senha local de emergência com hash **PBKDF2-SHA256** (210.000 iterações), usada apenas quando o Supabase não está disponível.
- Sessão salva em `sessionStorage`: fecha quando a aba é fechada.
- Bloqueio automático após **30 minutos de inatividade**.
- Limite de **5 tentativas** de senha, com bloqueio temporário de **5 minutos**.
- Botão **Segurança** no cabeçalho para trocar a senha local e sair do painel.
- Dados do catálogo não são carregados enquanto o painel está bloqueado e são removidos da tela ao sair.
- Escritas no Supabase só são tentadas com sessão Supabase ativa; se o RLS bloquear, o painel mostra o erro real (sem falso "salvo").
- Escape de HTML e validação de URLs de imagem na listagem (proteção contra XSS).
- Cabeçalhos/meta de segurança: `noindex`, `no-referrer`, `no-store` e Content Security Policy.
- A chave `anon` continua pública (como deve ser). **Nunca use a chave `service_role` no frontend.**

## Passo obrigatório no Supabase (proteção real)

O login na tela é importante, mas a proteção definitiva fica no banco. A versão anterior do `supabase-setup.sql` permitia escrita para **qualquer usuário autenticado**. O `supabase-setup.sql` atual já cria tudo protegido; para bancos criados com a versão antiga, rode `supabase-security.sql`, que troca as políticas por uma lista de administradores.

1. Em **Authentication → Users**, crie o usuário administrador.
2. Copie o **UUID** dele.
3. No **SQL Editor**, execute todo o arquivo `supabase-security.sql`.
4. No final do arquivo, descomente e execute o `INSERT` com o UUID e o e-mail:

```sql
insert into public.admin_users (user_id, email)
values ('SEU-UUID-AQUI', 'seu-email@exemplo.com')
on conflict (user_id) do nothing;
```

5. Confira:

```sql
select au.user_id, au.email, u.email as auth_email
from public.admin_users au
left join auth.users u on u.id = au.user_id;
```

Sem esse registro, o login Supabase é recusado e o banco também bloqueia escritas. Enquanto a função `is_admin` não existir, o painel recusa o login Supabase e mostra a instrução para executar o script; a senha local continua liberando a interface, mas sem publicar no banco.

## Senha local

A senha local inicial foi informada no atendimento e deve ser trocada no primeiro acesso, em **Segurança → Alterar senha local**.

Ela fica salva como hash no navegador. Limpar os dados do site restaura a senha padrão; por isso ela é apenas uma trava de tela. O hash da senha padrão está no código público do painel, então **não reutilize essa senha em outros serviços**. A autorização real para publicar no Supabase vem do login com uma conta presente em `admin_users`.

## Verificação extra por e-mail (opcional)

Em `supabase-config.js`, você pode preencher:

```js
ADMIN_EMAILS: ['seu-email@exemplo.com'],
```

Isso adiciona uma checagem no painel. A regra do banco (`admin_users`) continua sendo a proteção principal.

## Limitação importante

O site é estático (GitHub Pages). Nenhuma senha colocada apenas no HTML/JS é uma barreira definitiva contra alguém com acesso ao código. Por isso:

- a senha local serve para bloquear o uso casual do painel;
- o login Supabase + RLS por administrador é o que realmente impede alterações no catálogo;
- configure o Supabase para **não permitir cadastros públicos** em Authentication, se essa opção não for necessária;
- o GitHub Pages não permite cabeçalhos HTTP personalizados como `X-Frame-Options`; a CSP via `<meta>` cobre apenas parte das defesas do navegador.
