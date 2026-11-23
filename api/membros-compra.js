/* Webhook de compra da área de membros VESPRO (função da Vercel).
   URL para colar nas plataformas:
     Wiapy (área do Brasil):        https://vesprowallpapers.vercel.app/api/membros-compra?plataforma=wiapy&chave=SUA_CHAVE
     Lojou (área worldwide, África): https://vesprowallpapers.vercel.app/api/membros-compra?plataforma=lojou
       (SEM senha: a Lojou exige um webhook por produto. A função confere cada pedido na API da Lojou
        com LOJOU_API_KEY antes de liberar. Ver conferirLojou.)
     Stripe (área worldwide, cartão):  https://vesprowallpapers.vercel.app/api/membros-compra?plataforma=stripe&chave=SUA_CHAVE
       (evento checkout.session.completed; em cada Payment Link, metadado "produto_nome" com o nome da oferta,
        ex.: "Shadows Collection · Member Offer". A Stripe copia o metadado do link para a compra.)
     Hotmart (área worldwide, depois): ...?plataforma=hotmart&chave=SUA_CHAVE
   Variáveis na Vercel: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MEMBROS_WEBHOOK_KEY.

   Cada plataforma manda o aviso num formato diferente. Por isso a função procura
   e-mail, produto, pedido, valor e status em qualquer lugar do aviso, guarda o aviso
   inteiro na tabela "eventos" (para conferir) e grava a compra em "compras". */

// Cada plataforma alimenta a área de membros do seu país (coluna "loja" das compras).
// Desde 22/11/2026 a Lojou alimenta a área WORLDWIDE (ww), junto com a Stripe e, depois, a Hotmart.
// (As compras antigas 'za' continuam aparecendo na área worldwide: ver api/membros-entrar.js.)
const LOJA = { wiapy: "br", lojou: "ww", stripe: "ww", hotmart: "ww", manual: "br", manual_ww: "ww" };
// Coleções que a Lojou vende como order bump (únicas aceitas do aviso sem senha).
const BUMPS_LOJOU = ["shadows", "sporting", "movies"];
// Plataformas que mandam o valor em centavos.
const CENTAVOS = { stripe: true };

// Reconhecimento pelo nome (order bumps e produtos sem código cadastrado). A ordem importa.
const PELO_NOME = [
  [/acervo|archive/, ["acervo"]],
  [/expans|exclusiv/, ["exclusivas"]],          // "+150 Wallpapers · Expansão Exclusiva" (antes do "150")
  [/shadows.*sporting.*movies|3 em 1|3 cole/, ["shadows", "sporting", "movies"]],
  [/shadows.*sporting|sporting.*shadows/, ["shadows", "sporting"]],
  [/movies.*signature|signature.*movies|movies.*150/, ["movies", "signature"]],
  [/movies|filmes/, ["movies"]],
  [/shadows/, ["shadows"]],
  [/sporting/, ["sporting"]],
  [/signature|completa|complete|\b150\b/, ["signature"]],
  [/essencial|essential|\b75\b/, ["essencial"]]
];

const CHAVE_PRODUTO = /product|produto|offer|oferta|item|bump|plan|plano|checkout/i;
const APROVADO = /approv|aprov|paid|pago|complet|success|confirm|captur/i;
const DEVOLVIDO = /refund|reembols|chargeback|estorn|cancel|dispute/i;
const PENDENTE = /pend|wait|aguard|gerad|created|criad|abandon|recus|refus|declin|fail|expir/i;

function percorrer(obj, fn, caminho = []) {
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) percorrer(obj[k], fn, caminho.concat(k));
  } else fn(caminho, obj);
}

function ler(payload) {
  const r = { email: "", pedido: "", valor: null, status: [], produtos: [] };
  percorrer(payload, (caminho, v) => {
    if (v == null || v === "") return;
    const chave = (caminho[caminho.length - 1] || "").toString().toLowerCase();
    const tudo = caminho.join(".").toLowerCase();
    const s = String(v);
    if (!r.email && /mail/.test(chave) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()) && !/seller|vendedor|produtor|owner|support|suporte/.test(tudo)) r.email = s.trim().toLowerCase();
    if (/status|event|evento|^type$|situacao|situação/.test(chave)) r.status.push(s);
    if (!r.pedido && /^(order|pedido|transaction|transacao|transação|sale|venda|payment|pagamento)?_?(id|code|codigo|number|numero)$|order_?id|transaction_?id|sale_?id|^id$/.test(chave) && caminho.length <= 2) r.pedido = s;
    if (r.valor == null && /^(amount|valor|total|price|preco|preço|value)(_?total|_?paid|_?pago)?$/.test(chave) && !CHAVE_PRODUTO.test(tudo)) {
      const n = parseFloat(s.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
      if (!isNaN(n)) r.valor = n;
    }
    if (CHAVE_PRODUTO.test(tudo) && /(^|_)(name|nome|title|titulo|título|id|code|codigo|código|slug|hash|link|url)$/.test(chave)) r.produtos.push(s);
    else if (/bump/.test(tudo) && /^\d+$/.test(chave)) r.produtos.push(s); // lista de bumps só com o nome (ex.: Lojou)
  });
  return r;
}

function colecoesDe(textos, mapaCodigos) {
  const cols = new Set(), achados = [];
  for (const t of textos) {
    const limpo = t.trim();
    const codigo = Object.keys(mapaCodigos).find((c) => limpo === c || limpo.endsWith("/" + c) || limpo.includes("/" + c + "?"));
    if (codigo) { mapaCodigos[codigo].forEach((c) => cols.add(c)); achados.push(codigo); continue; }
    const n = limpo.toLowerCase();
    for (const [re, lista] of PELO_NOME) if (re.test(n)) { lista.forEach((c) => cols.add(c)); achados.push(limpo); break; }
  }
  return { colecoes: [...cols], achados };
}

async function supa(caminho, opcoes = {}) {
  const url = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + caminho;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(url, {
    ...opcoes,
    headers: { apikey: chave, ...(/^eyJ/.test(chave) ? { Authorization: "Bearer " + chave } : {}), "Content-Type": "application/json", ...(opcoes.headers || {}) } // chave nova (sb_secret_) vai só no apikey
  });
  if (!r.ok) throw new Error("Supabase " + r.status + ": " + (await r.text()).slice(0, 300));
  return r.status === 204 ? null : r.json().catch(() => null);
}

// API da Lojou (só leitura, escopo orders.read). Sem a chave, devolve null.
async function lojouApi(caminho) {
  const chave = process.env.LOJOU_API_KEY;
  if (!chave) return null;
  const r = await fetch("https://api.lojou.app" + caminho, { headers: { Authorization: "Bearer " + chave, Accept: "application/json" } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("Lojou " + r.status + ": " + String(j.message || "").slice(0, 120));
  return j;
}

// Confere na Lojou se o pedido do aviso existe, está aprovado e é do mesmo e-mail.
// Sem chave de API configurada: não confere (segue só com a senha da URL).
async function conferirLojou(d) {
  if (!process.env.LOJOU_API_KEY) return null;
  if (!d.pedido) return { ok: false, motivo: "aviso sem número de pedido" };
  try {
    const j = await lojouApi("/v1/orders/" + encodeURIComponent(d.pedido));
    const o = (j && j.data) || {};
    if (String(o.status || "").toLowerCase() !== "approved") return { ok: false, motivo: "status " + (o.status || "?") };
    const email = String((o.customer && o.customer.email) || "").trim().toLowerCase();
    if (email && email !== d.email) return { ok: false, motivo: "e-mail diferente do pedido" };
    return { ok: true, pedido: o };
  } catch (e) {
    return { ok: false, motivo: e.message };
  }
}

module.exports = async (req, res) => {
  if (req.method === "GET") return res.status(200).json({ ok: true, servico: "membros-compra" });
  if (req.method !== "POST") return res.status(405).end();

  const plataforma = String(req.query.plataforma || "wiapy").toLowerCase();
  const segredo = process.env.MEMBROS_WEBHOOK_KEY || "";
  const comSenha = !!segredo && (req.query.chave || "") === segredo;
  // Lojou: o painel exige um webhook por produto, então o endereço vai SEM senha.
  // Nesse caso só libera o que a API da Lojou confirmar (pedido aprovado, mesmo e-mail, produto do pedido).
  const lojouSemSenha = !comSenha && plataforma === "lojou";
  if (!comSenha && !lojouSemSenha) return res.status(401).json({ erro: "chave" });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ erro: "configuracao" });

  let payload = req.body;
  if (typeof payload === "string") { try { payload = JSON.parse(payload); } catch (e) { payload = { bruto: payload }; } }
  payload = payload || {};

  let resultado = "";
  try {
    const d = ler(payload);
    if (CENTAVOS[plataforma] && d.valor != null) d.valor = d.valor / 100;
    const status = d.status.join(" ").replace(/un.?paid|not.?paid|n[aã]o.?pago/gi, "pendente");
    const produtos = await supa("produtos?select=codigo,colecoes");
    const mapa = Object.fromEntries((produtos || []).map((p) => [p.codigo, p.colecoes]));
    let { colecoes, achados } = colecoesDe(d.produtos, mapa);

    // Lojou: "order_cancelled" é pagamento que falhou ou foi cancelado (não é reembolso).
    const lojouCancelado = plataforma === "lojou" && /cancel/i.test(status) && !/refund/i.test(status);
    // A Lojou não assina o aviso: com a chave de API (LOJOU_API_KEY), confirma o pedido direto na Lojou.
    const conferencia = plataforma === "lojou" && !lojouCancelado && APROVADO.test(status) ? await conferirLojou(d) : null;

    // Sem senha: o produto principal vem da API da Lojou (não do aviso). Dos order bumps do aviso
    // (a API não mostra os bumps) só valem as coleções que a Lojou oferece como bump.
    if (lojouSemSenha && conferencia && conferencia.ok) {
      const principal = String((conferencia.pedido.product && conferencia.pedido.product.name) || "");
      const bumps = (Array.isArray(payload.order_bump) ? payload.order_bump : [])
        .map((b) => typeof b === "string" ? b : String((b && (b.name || b.product_name || b.title)) || ""));
      const a = colecoesDe([principal], mapa);
      const extras = [], nomes = [];
      for (const nome of bumps) {
        const c = colecoesDe([nome], mapa).colecoes;
        if (c.length && c.every((x) => BUMPS_LOJOU.includes(x))) { extras.push(...c); nomes.push(nome); }
      }
      colecoes = [...new Set([...a.colecoes, ...extras])];
      achados = a.achados.concat(nomes);
    }

    if (!LOJA[plataforma]) resultado = "plataforma ainda não ligada: " + plataforma;
    else if (!d.email) resultado = "sem e-mail";
    else if (lojouCancelado) resultado = "ignorado (pagamento não concluído na Lojou)";
    else if (lojouSemSenha && !process.env.LOJOU_API_KEY) resultado = "aguardando LOJOU_API_KEY na Vercel para conferir (a conferência diária libera depois)";
    else if (lojouSemSenha && !APROVADO.test(status)) resultado = "ignorado sem senha (status " + status.slice(0, 40) + ")";
    else if (conferencia && !conferencia.ok) resultado = "não confirmado na Lojou: " + conferencia.motivo;
    else if (DEVOLVIDO.test(status)) {
      await supa("compras?email=eq." + encodeURIComponent(d.email) + (d.pedido ? "&pedido=eq." + encodeURIComponent(d.pedido) : ""), {
        method: "PATCH", body: JSON.stringify({ status: "reembolsada" })
      });
      resultado = "reembolso registrado";
    } else if (status && !APROVADO.test(status) && PENDENTE.test(status)) resultado = "ignorado (status " + status.slice(0, 60) + ")";
    else if (!colecoes.length) resultado = "produto não reconhecido: " + d.produtos.slice(0, 5).join(" | ").slice(0, 200);
    else {
      await supa("compras?on_conflict=plataforma,pedido,produto", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({
          email: d.email, colecoes, loja: LOJA[plataforma], plataforma,
          pedido: d.pedido || "sem-id-" + Date.now(), produto: achados.join(" + ").slice(0, 300),
          valor: d.valor, status: "aprovada"
        })
      });
      resultado = "liberado: " + colecoes.join(", ");
    }
  } catch (e) {
    resultado = "erro: " + e.message;
  }

  try { await supa("eventos", { method: "POST", body: JSON.stringify({ plataforma, payload, resultado }) }); } catch (e) {}
  // Sempre responde 200 para a plataforma não ficar reenviando; o que deu errado fica em "eventos".
  return res.status(200).json({ ok: true, resultado });
};
module.exports._teste = { ler, colecoesDe };
module.exports._lojou = { lojouApi, colecoesDe, supa, LOJA };
