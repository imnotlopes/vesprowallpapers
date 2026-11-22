/* API de conversão do Meta para as vendas da Lojou (landing da África do Sul, za.vesprowallpapers.com).

   A Lojou só aceita o Pixel ID (navegador). Para mandar a compra pelo servidor:
   1) Clique: quando a pessoa toca no botão de compra da landing, a página manda para cá
      (?acao=clique) os dados do navegador: cookies _fbp/_fbc, endereço da página e UTMs.
      Aqui juntamos user agent e IP e guardamos na tabela "eventos" (plataforma lojou-clique).
      Se o link não tiver utm_term, a página coloca utm_term=vz... (o código do clique),
      que a Lojou devolve no webhook.
   2) Venda: a Lojou chama esta URL (webhook order_approved, ?chave=MEMBROS_WEBHOOK_KEY).
      Achamos o clique (pelo código vz..., ou pelas mesmas UTMs nas últimas 3 h, ou por
      uma compra anterior do mesmo e-mail, caso do upsell) e mandamos o Purchase para o Meta.

   Variáveis na Vercel:
     META_CAPI_TOKEN        token da API de conversão (Gerenciador de Eventos > Configurações) [obrigatória]
     META_PIXEL_ID          pixel (padrão 1622328545867673)
     META_TEST_EVENT_CODE   opcional: código da aba "Testar eventos" (tirar depois do teste)
     MZN_POR_ZAR            opcional: quantos meticais valem 1 rand (padrão 3.72) para converter o valor
     LOJOU_API_KEY          opcional: confirma o pedido na API da Lojou antes de mandar
     SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MEMBROS_WEBHOOK_KEY (já existem)
   Nada de dado de cliente vai para a resposta; só o resumo do que aconteceu. */

const crypto = require("crypto");

const PIXEL = () => (process.env.META_PIXEL_ID || "1622328545867673").trim();
const GRAPH = "https://graph.facebook.com/v25.0/";
const SITE = "https://za.vesprowallpapers.com/";
const ORIGENS = /^https:\/\/([a-z0-9-]+\.)?vesprowallpapers\.com$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const UTMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest("hex");
const limpa = (s, n) => String(s == null ? "" : s).trim().slice(0, n || 300);

async function supa(caminho, opcoes = {}) {
  const url = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + caminho;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(url, {
    ...opcoes,
    headers: { apikey: chave, ...(/^eyJ/.test(chave) ? { Authorization: "Bearer " + chave } : {}), "Content-Type": "application/json", ...(opcoes.headers || {}) }
  });
  if (!r.ok) throw new Error("Supabase " + r.status + ": " + (await r.text()).slice(0, 200));
  return r.status === 204 ? null : r.json().catch(() => null);
}

function ipDe(req) {
  return limpa((req.headers["x-forwarded-for"] || "").split(",")[0] || req.headers["x-real-ip"] || "", 64);
}

function corpo(req) {
  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  if (Buffer.isBuffer(b)) { try { b = JSON.parse(b.toString("utf8")); } catch (e) { b = {}; } }
  return b && typeof b === "object" ? b : {};
}

/* ---------- 1) clique na landing ---------- */
async function clique(req, res) {
  const origem = req.headers.origin || "";
  if (ORIGENS.test(origem)) res.setHeader("Access-Control-Allow-Origin", origem);
  const b = corpo(req);
  const id = limpa(b.id, 40);
  if (!/^vz[a-z0-9]{8,30}$/.test(id)) return res.status(204).end();
  const utm = {};
  UTMS.forEach((k) => { if (b.utm && b.utm[k]) utm[k] = limpa(b.utm[k], 200); });
  const registro = {
    id,
    fbp: /^fb\.\d\.\d+\.\d+$/.test(b.fbp || "") ? b.fbp : "",
    fbc: /^fb\.\d\.\d+\./.test(b.fbc || "") ? limpa(b.fbc, 500) : "",
    url: /^https?:\/\//.test(b.url || "") ? limpa(b.url, 500) : SITE,
    plano: limpa(b.plano, 40),
    utm,
    ua: limpa(req.headers["user-agent"], 400),
    ip: ipDe(req)
  };
  try { await supa("eventos", { method: "POST", body: JSON.stringify({ plataforma: "lojou-clique", payload: registro, resultado: "clique" }) }); } catch (e) {}
  return res.status(204).end();
}

/* ---------- 2) venda (webhook da Lojou) ---------- */
async function acharClique(tracking, emailHash) {
  const valores = UTMS.map((k) => (tracking && tracking[k]) || "").join(" ");
  const codigo = (valores.match(/vz[a-z0-9]{8,30}/) || [])[0];
  if (codigo) {
    const r = await supa("eventos?select=payload&plataforma=eq.lojou-clique&payload->>id=eq." + codigo + "&limit=1");
    if (r && r[0]) return { ...r[0].payload, como: "codigo" };
  }
  const filtros = ["utm_campaign", "utm_content", "utm_term"].filter((k) => tracking && tracking[k])
    .map((k) => "&payload->utm->>" + k + "=eq." + encodeURIComponent(tracking[k]));
  if (filtros.length >= 2) {
    const desde = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    const r = await supa("eventos?select=payload&plataforma=eq.lojou-clique&criado_em=gte." + desde + filtros.join("") + "&order=criado_em.desc&limit=1");
    if (r && r[0]) return { ...r[0].payload, como: "utms" };
  }
  if (emailHash) {
    const r = await supa("eventos?select=payload&plataforma=eq.lojou-capi&payload->>em=eq." + emailHash + "&payload->>ua=neq.&order=criado_em.desc&limit=1");
    if (r && r[0]) return { ...r[0].payload, como: "email" };
  }
  return null;
}

async function venda(req, res) {
  const segredo = process.env.MEMBROS_WEBHOOK_KEY || "";
  if (!segredo || (req.query.chave || "") !== segredo) return res.status(401).json({ erro: "chave" });
  const p = corpo(req);
  let resultado = "", registro = {};
  try {
    const aprovado = /approved/i.test(String(p.order_type || "") + " " + String(p.status || ""));
    if (!aprovado) resultado = "ignorado: " + limpa(p.order_type || p.status, 40);
    else if (!process.env.META_CAPI_TOKEN) resultado = "falta META_CAPI_TOKEN";
    else {
      const pedido = limpa(p.order_number || p.transaction_id, 60);
      if (process.env.LOJOU_API_KEY && pedido) {
        const r = await fetch("https://api.lojou.app/v1/orders/" + encodeURIComponent(pedido), { headers: { Authorization: "Bearer " + process.env.LOJOU_API_KEY } });
        const j = await r.json().catch(() => ({}));
        const st = JSON.stringify((j && j.data) || {}).match(/"status":"([a-z_]+)"/i);
        if (!r.ok || (st && !/approved|paid|complete/i.test(st[1]))) throw new Error("pedido não confirmado na Lojou (" + r.status + ")");
      }
      const c = p.customer || {};
      const email = limpa(c.email, 200).toLowerCase();
      const fone = String(c.mobile_number || c.payment_number || "").replace(/\D/g, "");
      const nomes = limpa(c.name, 200).toLowerCase().split(/\s+/).filter(Boolean);
      const em = email ? sha(email) : "";
      const clq = await acharClique(p.tracking || {}, em);

      const user_data = {};
      if (em) { user_data.em = [em]; user_data.external_id = [em]; }
      if (fone) user_data.ph = [sha(fone)];
      if (nomes[0]) user_data.fn = [sha(nomes[0])];
      if (nomes.length > 1) user_data.ln = [sha(nomes[nomes.length - 1])];
      if (fone.startsWith("27")) user_data.country = [sha("za")];
      if (clq) {
        if (clq.ua) user_data.client_user_agent = clq.ua;
        if (clq.ip) user_data.client_ip_address = clq.ip;
        if (clq.fbp) user_data.fbp = clq.fbp;
        if (clq.fbc) user_data.fbc = clq.fbc;
      }

      const moeda = limpa(p.currency || "ZAR", 3).toUpperCase();
      const bruto = parseFloat(p.amount) || 0;
      const taxa = parseFloat(process.env.MZN_POR_ZAR || "3.72");
      const valor = moeda === "MZN" ? Math.round((bruto / taxa) * 100) / 100 : bruto;
      const nomesProd = [p.product && p.product.name].concat((p.order_bump || []).map((o) => o && (o.name || o.title))).filter(Boolean);

      const evento = {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: "lojou_" + pedido,
        action_source: user_data.client_user_agent ? "website" : "system_generated",
        user_data,
        custom_data: {
          currency: moeda === "MZN" ? "ZAR" : moeda,
          value: valor,
          order_id: pedido,
          content_name: nomesProd.join(" + ").slice(0, 200),
          content_ids: [p.product && p.product.pid].filter(Boolean),
          content_type: "product"
        }
      };
      if (evento.action_source === "website") evento.event_source_url = (clq && clq.url) || SITE;

      const corpoMeta = { data: [evento] };
      if (process.env.META_TEST_EVENT_CODE) corpoMeta.test_event_code = process.env.META_TEST_EVENT_CODE;
      const r = await fetch(GRAPH + PIXEL() + "/events?access_token=" + encodeURIComponent(process.env.META_CAPI_TOKEN), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpoMeta)
      });
      const j = await r.json().catch(() => ({}));
      resultado = r.ok
        ? "enviado ao Meta (" + evento.action_source + ", clique: " + (clq ? clq.como : "não achado") + ", R" + valor + ")"
        : "erro do Meta " + r.status + ": " + limpa(j.error && j.error.message, 160);
      registro = { pedido, em, ua: (clq && clq.ua) || "", ip: (clq && clq.ip) || "", fbp: (clq && clq.fbp) || "", fbc: (clq && clq.fbc) || "", url: (clq && clq.url) || "", valor, como: clq ? clq.como : "" };
    }
  } catch (e) {
    resultado = "erro: " + e.message;
  }
  try { await supa("eventos", { method: "POST", body: JSON.stringify({ plataforma: "lojou-capi", payload: registro, resultado }) }); } catch (e) {}
  // Sempre 200: a Lojou não reenvia, e o que deu errado fica registrado em "eventos".
  return res.status(200).json({ ok: true, resultado });
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    const origem = req.headers.origin || "";
    if (ORIGENS.test(origem)) { res.setHeader("Access-Control-Allow-Origin", origem); res.setHeader("Access-Control-Allow-Methods", "POST"); res.setHeader("Access-Control-Allow-Headers", "Content-Type"); }
    return res.status(204).end();
  }
  if (req.method === "GET") return res.status(200).json({ ok: true, servico: "lojou-capi" });
  if (req.method !== "POST") return res.status(405).end();
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ erro: "configuracao" });
  if (req.query.acao === "clique") return clique(req, res);
  return venda(req, res);
};
module.exports._teste = { acharClique, sha };
