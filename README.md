# 123quadro

## Segurança

O painel administrativo (`admin.html`) exige autenticação e possui bloqueio por inatividade, limite de tentativas e proteção por RLS no Supabase. Consulte [SEGURANCA.md](SEGURANCA.md) para configurar corretamente o banco e o usuário administrador.

## Depoimentos / Elogios

Os depoimentos exibidos na home são gerenciados pelo painel administrativo, na seção **Elogios / Depoimentos**.

Para habilitar a persistência no Supabase:

1. No **SQL Editor** do Supabase, execute o arquivo `supabase-depoimentos.sql`.
   - Em instalações novas, o `supabase-setup.sql` já cria a tabela.
   - Para reforçar a segurança de um banco existente, execute também o `supabase-security.sql`.
2. Entre no painel administrativo com uma conta presente em `admin_users`.
3. Cadastre, edite, ative/desative ou exclua os depoimentos.

A quantidade exibida no site corresponde ao total de depoimentos ativos. Sem conexão com o Supabase, o painel salva as alterações apenas no `localStorage` (modo local).
