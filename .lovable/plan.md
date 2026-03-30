

# Fix: Painel de Produtos travado em "Carregando..."

## Problema

O `AdminAuthContext` tem duas fontes de inicializacao concorrentes (`onAuthStateChange` + `getSession`) que podem causar race conditions. Alem disso, se o RPC `has_role` falhar (erro de rede, usuario sem role), nao ha tratamento de erro — o `loading` pode nunca resolver.

Tambem ha dois `AdminAuthProvider` separados (um para `/admin/login` e outro para `/admin/*`), o que significa que o estado de autenticacao nao e compartilhado entre eles.

## Alteracoes

### 1. `src/contexts/AdminAuthContext.tsx`
- Remover a chamada duplicada `getSession` — usar apenas `onAuthStateChange` que ja emite `INITIAL_SESSION` como primeiro evento
- Adicionar try/catch no `checkAdminRole` para que erros nao travem o loading
- Garantir que `setLoading(false)` sempre executa

### 2. `src/App.tsx`
- Mover o `AdminAuthProvider` para envolver TODAS as rotas admin (login + layout) em um unico provider, evitando instancias separadas

## Arquivos
- `src/contexts/AdminAuthContext.tsx` — fix race condition + error handling
- `src/App.tsx` — single AdminAuthProvider wrapper

