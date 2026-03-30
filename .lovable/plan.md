

# CRUD Completo de Produtos — Admin Bruna Perfumaria

## Problema
A aba Produtos no admin apenas lista produtos com toggles de ativo/destaque. Nao permite cadastrar, editar ou excluir produtos.

## Solucao

Reescrever `AdminProducts.tsx` com CRUD completo e criar um componente de formulario `ProductFormDialog.tsx`.

### 1. `src/components/admin/ProductFormDialog.tsx` (CRIAR)
Dialog/Sheet com formulario completo para criar e editar produtos:
- **Titulo** (text input, obrigatorio)
- **Slug** (auto-gerado do titulo, editavel)
- **Preco** (number input com mascara R$)
- **Categoria** (select dropdown carregado do Supabase `categories`)
- **Descricao** (textarea)
- **Imagens** (upload para Supabase Storage bucket `product-images`, preview das imagens, remover imagem)
- **Ativo** (switch, default true)
- **Destaque** (switch, default false)
- Botao salvar: INSERT se novo, UPDATE se editando
- Validacao: titulo e preco obrigatorios

### 2. `src/pages/admin/AdminProducts.tsx` (REESCREVER)
- Botao **"+ Novo Produto"** no header que abre o ProductFormDialog em modo criacao
- Lista de produtos em cards (manter layout atual)
- Adicionar botoes **Editar** (abre dialog preenchido) e **Excluir** (confirm dialog + delete) em cada card
- Busca/filtro por nome (input search)
- Filtro por categoria (select)
- Ao salvar/excluir, atualiza lista automaticamente

### 3. Upload de Imagens
- Upload para bucket `product-images` (ja existe e e publico)
- Path: `product-images/{productId}/{timestamp}.{ext}`
- Apos upload, salva URL publica no array `images[]` do produto
- Preview com miniatura e botao X para remover

## Arquivos

| Arquivo | Acao |
|---------|------|
| `src/components/admin/ProductFormDialog.tsx` | Criar |
| `src/pages/admin/AdminProducts.tsx` | Reescrever com CRUD completo |

## Detalhes Tecnicos
- Slug gerado com: `title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
- Upload usa `supabase.storage.from('product-images').upload(path, file)`
- URL publica via `supabase.storage.from('product-images').getPublicUrl(path)`
- Delete produto: `supabase.from('products').delete().eq('id', id)` (RLS ja permite para admin)
- Nenhuma migration necessaria — tabelas e policies ja existem

