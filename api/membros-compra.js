/* Webhook de compra da área de membros VESPRO (função da Vercel).
   URL para colar nas plataformas:
     Wiapy (área do Brasil):        https://vesprowallpapers.vercel.app/api/membros-compra?plataforma=wiapy&chave=SUA_CHAVE
     Lojou (área da África do Sul): https://vesprowallpapers.vercel.app/api/membros-compra?plataforma=lojou&chave=SUA_CHAVE
   Variáveis na Vercel: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MEMBROS_WEBHOOK_KEY.

   Cada plataforma manda o aviso num formato diferente. Por isso a função procura
   e-mail, produto, pedido, valor e status em qualquer lugar do aviso, guarda o aviso
   inteiro na tabela "eventos" (para conferir) e grava a compra em "compras". */

// Cada plataforma alimenta a área de membros do seu país (coluna "loja" das compras).
// Stripe (site da marca, dólar) fica para depois.
const LOJA = { wiapy: "br", lojou: "za", manual: "br" };

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

module.exports = async (req, res) => {
  if (req.method === "GET") return res.status(200).json({ ok: true, servico: "membros-compra" });
  if (req.method !== "POST") return res.status(405).end();

  const segredo = process.env.MEMBROS_WEBHOOK_KEY || "";
  if (!segredo || (req.query.chave || "") !== segredo) return res.status(401).json({ erro: "chave" });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ erro: "configuracao" });

  const plataforma = String(req.query.plataforma || "wiapy").toLowerCase();
  let payload = req.body;
  if (typeof payload === "string") { try { payload = JSON.parse(payload); } catch (e) { payload = { bruto: payload }; } }
  payload = payload || {};

  let resultado = "";
  try {
    const d = ler(payload);
    const status = d.status.join(" ").replace(/un.?paid|not.?paid|n[aã]o.?pago/gi, "pendente");
    const produtos = await supa("produtos?select=codigo,colecoes");
    const mapa = Object.fromEntries((produtos || []).map((p) => [p.codigo, p.colecoes]));
    const { colecoes, achados } = colecoesDe(d.produtos, mapa);

    if (!LOJA[plataforma]) resultado = "plataforma ainda não ligada: " + plataforma;
    else if (!d.email) resultado = "sem e-mail";
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
