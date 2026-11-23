/* Conferência diária das vendas da Lojou (função da Vercel, roda sozinha pelo "crons" do vercel.json).
   A Lojou manda o aviso de compra uma vez só, sem repetir se falhar. Esta função pega na API da Lojou
   os pedidos APROVADOS que ainda não estão no banco e libera na área de membros worldwide.
   Também serve para importar as vendas antigas: abrir /api/membros-lojou-sync?paginas=50

   Variáveis na Vercel: LOJOU_API_KEY (Lojou > Desenvolvedor > Chaves API, só "orders.read"),
   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

   Não precisa de senha: só grava pedidos confirmados como aprovados pela própria Lojou,
   e responde apenas contagens (nenhum e-mail ou dado de cliente sai daqui). */
const { lojouApi, colecoesDe, supa, LOJA } = require("./membros-compra.js")._lojou;

const MAX_DETALHES = 40;   // pedidos novos consultados por vez (cada um é uma chamada à Lojou)

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.LOJOU_API_KEY) return res.status(503).json({ erro: "falta LOJOU_API_KEY" });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ erro: "configuracao" });

  const paginas = Math.min(Math.max(parseInt(req.query.paginas, 10) || 3, 1), 50);
  const r = { aprovados_vistos: 0, ja_no_banco: 0, liberados: 0, nao_reconhecidos: 0, erros: 0, faltou_tempo: false };
  try {
    // pedidos aprovados (os mais recentes primeiro, 100 por página)
    const pedidos = [];
    for (let p = 1; p <= paginas; p++) {
      const j = await lojouApi("/v1/orders?status=approved&per_page=100&page=" + p);
      const lista = (j && (j.orders || (j.data && j.data.orders) || j.data)) || [];
      if (!Array.isArray(lista) || !lista.length) break;
      pedidos.push(...lista);
      if (j.last_page && p >= j.last_page) break;
    }
    r.aprovados_vistos = pedidos.length;

    const ja = await supa("compras?select=pedido&plataforma=eq.lojou&limit=10000");
    const noBanco = new Set((ja || []).map((c) => String(c.pedido)));
    const novos = pedidos.filter((o) => o && o.order_number && !noBanco.has(String(o.order_number)));
    r.ja_no_banco = pedidos.length - novos.length;
    if (novos.length > MAX_DETALHES) r.faltou_tempo = true;

    const produtos = await supa("produtos?select=codigo,colecoes");
    const mapa = Object.fromEntries((produtos || []).map((p) => [p.codigo, p.colecoes]));

    for (const o of novos.slice(0, MAX_DETALHES)) {
      try {
        const det = ((await lojouApi("/v1/orders/" + encodeURIComponent(o.order_number))) || {}).data || {};
        const email = String((det.customer && det.customer.email) || "").trim().toLowerCase();
        const nome = String((det.product && det.product.name) || "");
        if (String(det.status).toLowerCase() !== "approved" || !email) continue;
        const { colecoes, achados } = colecoesDe([nome], mapa);
        if (!colecoes.length) { r.nao_reconhecidos++; continue; }
        await supa("compras?on_conflict=plataforma,pedido,produto", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify({
            email, colecoes, loja: LOJA.lojou, plataforma: "lojou",
            pedido: String(o.order_number), produto: achados.join(" + ").slice(0, 300),
            valor: det.amount != null ? Number(det.amount) : null, status: "aprovada"
          })
        });
        r.liberados++;
      } catch (e) { r.erros++; }
    }
    // Obs.: a API não mostra os order bumps do pedido. Bump que o aviso perdeu é liberado à mão (01-banco.sql).
    try { await supa("eventos", { method: "POST", body: JSON.stringify({ plataforma: "lojou-sync", payload: { paginas }, resultado: JSON.stringify(r) }) }); } catch (e) {}
    return res.status(200).json({ ok: true, ...r });
  } catch (e) {
    return res.status(500).json({ ok: false, erro: e.message.slice(0, 200), ...r });
  }
};
