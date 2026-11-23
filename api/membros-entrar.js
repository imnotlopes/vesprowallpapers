/* Entrada na área de membros só com e-mail (função da Vercel).
   A página manda { email, pais } e recebe as coleções que esse e-mail comprou naquele país.
   Variáveis na Vercel: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MEMBROS_WEBHOOK_KEY (usada para embaralhar o IP).

   Proteções:
   - a página nunca fala direto com o banco (só esta função, com a chave secreta);
   - cada IP tem no máximo LIMITE_FALHAS tentativas erradas a cada 10 minutos;
   - toda tentativa fica na tabela "acessos" (dá para ver e-mails usados em aparelhos demais). */
const crypto = require("crypto");

const PAISES = ["br", "za", "ww"];
// A área worldwide (ww) também mostra as compras antigas marcadas como 'za' (Lojou, antes de 22/11/2026).
const JUNTAR = { ww: ["ww", "za"] };
const LIMITE_FALHAS = 10;          // e-mails sem compra por IP, a cada 10 minutos
const ORIGENS = [                   // sites que podem chamar esta função
  "https://membros.vesprowallpapers.com",
  "https://members.vesprowallpapers.com",
  "https://vesprowallpapers.vercel.app",
  "https://za.vesprowallpapers.com",
  "http://localhost:5173",
  "http://localhost:5178"
];

async function supa(caminho, opcoes = {}) {
  const url = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + caminho;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(url, {
    ...opcoes,
    headers: { apikey: chave, ...(/^eyJ/.test(chave) ? { Authorization: "Bearer " + chave } : {}), "Content-Type": "application/json", ...(opcoes.headers || {}) } // chave nova (sb_secret_) vai só no apikey
  });
  if (!r.ok) throw new Error("Supabase " + r.status + ": " + (await r.text()).slice(0, 200));
  return r.status === 204 ? null : r.json().catch(() => null);
}

// Junta as respostas de mais de uma loja (ex.: ww + za) numa só.
function juntar(partes, pais) {
  const r = { acervo: false, colecoes: {}, pago: 0, loja: pais };
  for (const d of partes) {
    if (!d) continue;
    r.acervo = r.acervo || !!d.acervo;
    for (const [id, links] of Object.entries(d.colecoes || {})) r.colecoes[id] = { ...(r.colecoes[id] || {}), ...(links || {}) };
    r.pago += Number(d.pago) || 0;
    for (const k of Object.keys(d)) if (!(k in r)) r[k] = d[k];
  }
  return r;
}

module.exports = async (req, res) => {
  const origem = req.headers.origin || "";
  if (ORIGENS.includes(origem)) {
    res.setHeader("Access-Control-Allow-Origin", origem);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ erro: "metodo" });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ erro: "configuracao" });

  let corpo = req.body;
  if (typeof corpo === "string") { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
  corpo = corpo || {};
  const email = String(corpo.email || "").trim().toLowerCase().slice(0, 200);
  const pais = PAISES.includes(corpo.pais) ? corpo.pais : "br";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ erro: "email" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || (req.socket && req.socket.remoteAddress) || "";
  const ipHash = crypto.createHash("sha256").update(ip + "|" + (process.env.MEMBROS_WEBHOOK_KEY || "vespro")).digest("hex").slice(0, 32);
  const agente = String(req.headers["user-agent"] || "").slice(0, 200);

  try {
    const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const falhas = await supa("acessos?select=id&encontrado=eq.false&ip_hash=eq." + ipHash + "&criado_em=gte." + encodeURIComponent(desde) + "&limit=" + (LIMITE_FALHAS + 1));
    if ((falhas || []).length >= LIMITE_FALHAS) return res.status(429).json({ erro: "muitas_tentativas" });

    const lojas = JUNTAR[pais] || [pais];
    const partes = await Promise.all(lojas.map((l) => supa("rpc/area_por_email", { method: "POST", body: JSON.stringify({ p_email: email, p_loja: l }) })));
    const dados = juntar(partes, pais);
    const encontrado = !!dados && (dados.acervo || Object.keys(dados.colecoes || {}).length > 0);

    await supa("acessos", { method: "POST", body: JSON.stringify({ email, loja: pais, ip_hash: ipHash, agente, encontrado }) }).catch(() => {});

    if (!encontrado) return res.status(404).json({ erro: "nao_encontrado" });
    // país de quem está vendo (a Vercel manda pelo IP): a área worldwide escolhe o checkout por ele
    const paisVisitante = String(req.headers["x-vercel-ip-country"] || "").toUpperCase().slice(0, 2);
    return res.status(200).json({ ...dados, pais_visitante: paisVisitante });
  } catch (e) {
    return res.status(500).json({ erro: "servidor" });
  }
};
