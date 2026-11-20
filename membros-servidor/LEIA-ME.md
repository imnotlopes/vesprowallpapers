# Área de membros VESPRO™: como colocar no ar

Cada país tem a sua área de membros, separada (clientes, moeda, checkout e preços de cada um):

| País | Endereço | Moeda / checkout | Idioma padrão | Configuração |
|---|---|---|---|---|
| Brasil | membros.vesprowallpapers.com (ou vesprowallpapers.vercel.app/membros/) | R$ / Wiapy | Português | `membros/config.js` |
| África do Sul | za.vesprowallpapers.com/members/ | rand / Lojou | Inglês | `membros-servidor/paises/za.js` |

A área do Brasil é a original. A da África do Sul é gerada a partir dela: depois de mexer em qualquer coisa, rodar `python membros-servidor/gerar-paises.py` (copia a página para `landing za/members/` e as imagens que faltam lá). As duas usam o mesmo banco; cada uma só enxerga as compras do seu país (coluna `loja`: `br` ou `za`). Todas têm a troca PT / EN / ES no topo.

**Entrada só com e-mail**, sem senha e sem código: a pessoa digita o e-mail da compra e a função `api/membros-entrar.js` confere no banco o que ela comprou naquele país. A área lembra o e-mail no aparelho. Proteções: a página nunca fala direto com o banco, cada aparelho tem no máximo 10 tentativas erradas a cada 10 minutos e toda entrada fica na tabela `acessos`.

Enquanto `modoDemo: true` (em `membros/config.js`), a área abre em **modo demonstração**: entra com qualquer e-mail e tem um seletor de perfil de cliente para ver como a área fica para cada um.

## Onde fica cada coisa

| Arquivo | O que é |
|---|---|
| `membros/index.html` | Visual da área (cores, fontes e texturas da VESPRO) |
| `membros/config.js` | Conexão, coleções, prévias, ofertas, preços e links de checkout |
| `membros/textos.js` | Todos os textos em português, inglês e espanhol |
| `membros/app.js` | Login, separação Wallpapers / Movies, escada de upsell |
| `api/membros-entrar.js` | Entrada só com e-mail: confere a compra e devolve as coleções |
| `api/membros-compra.js` | Recebe o aviso de compra das plataformas e libera o acesso |
| `membros-servidor/01-banco.sql` | Tabelas do banco e lista de produtos |
| `membros-servidor/02-links.sql` | Links do Drive (fica só no computador, fora do GitHub) |
| `membros-servidor/ESTRATEGIA-UPSELL.md` | Estratégia de venda para quem já é cliente |
| `membros-servidor/paises/za.js` | O que muda na área da África do Sul (idioma, rand, preços) |
| `membros-servidor/gerar-paises.py` | Gera a área de cada país a partir da do Brasil |

A pasta `membros-servidor/` não vai para o site (`.vercelignore`).

## Passo a passo

1. **Supabase**: criar um projeto (o plano grátis serve para começar).
2. **Banco**: no SQL Editor, rodar `01-banco.sql` e depois `02-links.sql`.
3. **Vercel**: em Settings > Environment Variables do projeto `vesprowallpapers`, criar `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (Supabase > Settings > API; a chave é secreta, nunca vai na página) e `MEMBROS_WEBHOOK_KEY` (uma senha longa inventada). Depois, Redeploy.
4. **Ligar a área**: em `membros/config.js`, trocar `modoDemo: true` para `false`, rodar `python membros-servidor/gerar-paises.py` e subir.
5. **Webhooks**: cadastrar o aviso de "compra aprovada" e "reembolso":
   - Wiapy (área do Brasil): `https://membros.vesprowallpapers.com/api/membros-compra?plataforma=wiapy&chave=SUA_CHAVE`
   - Lojou (área da África do Sul): mesmo endereço com `plataforma=lojou`
   Stripe (site da marca, dólar) fica para depois. Na Lojou ainda falta confirmar se tem esse aviso.

   **Na Wiapy (conferido em 20/11/2026):** Integrações > Webhook. Campos:
   - Nome: "Área de membros VESPRO"
   - Produtos: marcar só os da VESPRO (não os de moda/criativos)
   - Url para enviar (post): o endereço acima, com `plataforma=wiapy`
   - Token para autenticação: a mesma `MEMBROS_WEBHOOK_KEY`
   - Eventos: Pagamento aprovado, Pagamento Estornado e Chargeback
   - Depois de salvar, usar o botão TESTAR e ver o resultado na tabela `eventos`.
   O webhook da Wiapy manda o ID interno do produto (ex.: 6aa8d1be...), não o código do link de checkout. Esses IDs já estão no `01-banco.sql`. Falta decidir o que libera o "120 Wallpapers Vespro™ (Celular)".
   A Wiapy também tem área de membros própria (menu Members, no formato de curso). Não usamos: a nossa é feita para galeria e download.
6. **Primeira venda**: abrir a tabela `eventos` no Supabase e ver a coluna `resultado`. Se aparecer "produto não reconhecido", acrescentar o código na tabela `produtos`. Conferir também se o `valor` veio em reais (e não em centavos).
7. **Clientes antigos**: exportar as vendas da Wiapy (loja `br`) e da Lojou (loja `za`) e importar na tabela `compras` (e-mail, coleções, loja, valor). Sem isso, quem comprou antes entra e vê tudo trancado.
8. **Entrega**: no conteúdo de cada produto (Wiapy: /membros/; Lojou: za.vesprowallpapers.com/members/), colocar o link da área de membros junto com os links do Drive.
9. **Ofertas de membro**: criar os produtos (ver preços em `ESTRATEGIA-UPSELL.md`) e colar os links: Brasil em `membros/config.js` (`loja.ofertas`), África do Sul em `membros-servidor/paises/za.js`. Sem link, o botão abre o WhatsApp do suporte.

## Liberar ou tirar acesso à mão

No SQL Editor do Supabase (exemplos no fim do `01-banco.sql`):

```sql
insert into public.compras (email, colecoes, loja, plataforma, pedido, produto, valor)
values ('cliente@email.com', '{signature}', 'br', 'manual', 'manual-001', 'Coleção Completa', 21.90);
```

Códigos das coleções: `signature`, `essencial`, `shadows`, `sporting`, `exclusivas`, `movies`, e `acervo` (libera tudo, inclusive coleções futuras).

## Coleção nova

1. Acrescentar a coleção em `membros/config.js` (`colecoes`) e o nome e a descrição em `membros/textos.js` (`cols`).
2. No Supabase: `insert into public.colecoes (id, nome, links) values (...)`.
3. Quem tem o Acervo (VIP) já recebe na hora, sem fazer nada.

## Limite desta primeira versão

Os downloads ainda abrem as pastas do Drive. A pessoa precisa entrar para ver o link, mas depois pode repassar (ou repassar o próprio e-mail). Para ver e-mails usados em aparelhos demais, há uma consulta pronta no fim do `01-banco.sql`. Se a pirataria pesar: pedir código só para aparelho novo e tirar os arquivos do Drive para links que expiram.
